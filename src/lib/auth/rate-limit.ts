import 'server-only';
import crypto from 'node:crypto';
import { isIP } from 'node:net';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { generateSessionToken, hashSessionToken } from './session';
import {
  INACTIVITY_LIFETIME_MS,
  type CurrentSession,
} from './session-service';

/**
 * Maximum permitted consecutive failed login attempts before lockout.
 */
export const MAX_FAILED_ATTEMPTS = 5;

/**
 * Result returned by rate-limit evaluation checks and failure recordings.
 */
export interface RateLimitResult {
  allowed: boolean;
  isLocked: boolean;
  attempts: number;
  retryAfterSeconds?: number;
}

/**
 * Result returned by the atomic authentication claim and session creation transaction.
 */
export interface AuthClaimResult {
  success: boolean;
  isLocked: boolean;
  retryAfterSeconds?: number;
  session?: CurrentSession;
  rawToken?: string;
}

/**
 * Dedicated internal error used exclusively to trigger a real PostgreSQL transaction
 * ROLLBACK (Option A) when an account is found to be locked out concurrently during claim execution.
 */
export class ConcurrentLockoutError extends Error {
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super('Account is locked.');
    this.name = 'ConcurrentLockoutError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/**
 * Thrown when client IP extraction fails in production due to a missing,
 * unconfigured, malformed, or ambiguous reverse-proxy header.
 * Mappable by callers (e.g. Server Actions) to a generic 503 Service Unavailable response.
 */
export class ClientIpResolutionError extends Error {
  readonly code = 'UNTRUSTED_CLIENT_IP';

  constructor(message = 'Unable to safely determine client IP address.') {
    super(message);
    this.name = 'ClientIpResolutionError';
  }
}

/**
 * RFC 9110 / RFC 7230 token definition for HTTP header field names:
 * 1 or more ASCII alphanumeric or allowed punctuation characters: !#$%&'*+-.^_`|~
 * Disallows whitespace, commas, colons, control characters, and non-ASCII characters.
 */
const HTTP_HEADER_NAME_REGEX = /^[!#$%&'*+\-.^_`|~0-9a-zA-Z]+$/;

/**
 * Safely extracts the client IP address with strict reverse-proxy validation and environment awareness.
 *
 * In local development and automated unit tests (`NODE_ENV !== 'production'`), this defaults
 * to `'127.0.0.1'` to avoid socket ambiguity.
 *
 * In production:
 * - Requires an explicitly configured `process.env.TRUSTED_IP_HEADER`.
 * - Validates that the configured header is a legal HTTP header field-name (RFC 9110 token).
 * - Strictly inspects ONLY that configured header (zero fallback to secondary headers).
 * - Rejects missing, empty, or ambiguous comma-separated header lists.
 * - Validates IPv4 / IPv6 format using `node:net` `isIP()`.
 * - Canonicalizes valid IPv6 addresses into RFC 5952 standard lowercase form.
 * - Throws `ClientIpResolutionError` on failure (never silently defaults to 127.0.0.1 in production).
 *
 * NOTE: Production reverse proxies (Nginx, ALB, Cloudflare) must be configured to unconditionally
 * overwrite this header using the TCP remote address ($remote_addr) and strip client-supplied headers.
 *
 * @returns The validated and canonicalized client IP string.
 * @throws {ClientIpResolutionError} If IP extraction fails or is untrusted in production.
 */
export async function getClientIp(): Promise<string> {
  if (process.env.NODE_ENV !== 'production') {
    return '127.0.0.1';
  }

  const rawConfigured = process.env.TRUSTED_IP_HEADER;
  if (!rawConfigured) {
    throw new ClientIpResolutionError(
      'TRUSTED_IP_HEADER must be explicitly configured in production environment.'
    );
  }

  // Reject malformed header names (including whitespace, commas, colons, and invalid characters)
  if (!HTTP_HEADER_NAME_REGEX.test(rawConfigured)) {
    throw new ClientIpResolutionError(
      `TRUSTED_IP_HEADER configuration "${rawConfigured}" is not a valid HTTP header name.`
    );
  }

  const configuredHeader = rawConfigured.toLowerCase();

  let rawHeader: string | null = null;
  try {
    const headerStore = await headers();
    rawHeader = headerStore.get(configuredHeader);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new ClientIpResolutionError(
        `Invalid HTTP header name in TRUSTED_IP_HEADER: ${error.message}`
      );
    }
    throw error;
  }

  if (!rawHeader) {
    throw new ClientIpResolutionError(
      `Trusted proxy IP header "${configuredHeader}" is missing from incoming request.`
    );
  }

  const trimmed = rawHeader.trim();

  // Reject empty values or ambiguous comma-separated lists
  if (!trimmed || trimmed.includes(',')) {
    throw new ClientIpResolutionError(
      'Trusted proxy IP header is empty or contains an ambiguous multi-hop address list.'
    );
  }

  const ipVersion = isIP(trimmed);
  if (ipVersion === 4) {
    return trimmed;
  }

  if (ipVersion === 6) {
    try {
      return new URL(`http://[${trimmed}]`).hostname.slice(1, -1).toLowerCase();
    } catch {
      throw new ClientIpResolutionError('Malformed IPv6 address in trusted proxy header.');
    }
  }

  throw new ClientIpResolutionError(
    'Trusted proxy header does not contain a valid IPv4 or IPv6 address.'
  );
}

/**
 * Computes a standardized composite SHA-256 identifier binding normalized email and client IP.
 * Enforces lowercase and whitespace trimming, plus RFC 5952 IPv6 canonicalization to prevent
 * rate-limit bypasses via format variation.
 *
 * @param email - The user's input email address.
 * @param clientIp - The validated client IP address.
 * @returns A 64-character lowercase hexadecimal SHA-256 digest.
 */
export function createRateLimitIdentifier(email: string, clientIp: string): string {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedIp = clientIp.trim();
  let normalizedIp = trimmedIp;

  if (isIP(trimmedIp) === 6) {
    try {
      normalizedIp = new URL(`http://[${trimmedIp}]`).hostname.slice(1, -1).toLowerCase();
    } catch {
      normalizedIp = trimmedIp.toLowerCase();
    }
  }

  return crypto.createHash('sha256').update(`${normalizedEmail}:${normalizedIp}`).digest('hex');
}

/**
 * Non-mutating pre-check to reject actively locked accounts before running expensive
 * cryptographic password hashing operations (bcrypt ~150-300ms).
 *
 * Evaluates lockout status directly within PostgreSQL using `clock_timestamp()`.
 *
 * @param email - The user's email address.
 * @param clientIp - The client's IP address.
 * @returns RateLimitResult with `allowed: false` if actively locked.
 */
export async function checkRateLimit(email: string, clientIp: string): Promise<RateLimitResult> {
  const identifier = createRateLimitIdentifier(email, clientIp);

  const rows = await prisma.$queryRaw<Array<{
    attempts: number;
    lockedUntil: Date | null;
    isLocked: boolean;
    retryAfterSeconds: number | null;
  }>>`
    SELECT
      "attempts",
      "lockedUntil",
      ("lockedUntil" IS NOT NULL AND "lockedUntil" > clock_timestamp()) AS "isLocked",
      CASE
        WHEN "lockedUntil" IS NOT NULL AND "lockedUntil" > clock_timestamp()
          THEN GREATEST(1, CEIL(EXTRACT(EPOCH FROM ("lockedUntil" - clock_timestamp()))))::int
        ELSE NULL
      END AS "retryAfterSeconds"
    FROM "LoginAttempt"
    WHERE "identifier" = ${identifier};
  `;

  if (rows.length === 0) {
    return { allowed: true, isLocked: false, attempts: 0 };
  }

  const record = rows[0];
  return {
    allowed: !record.isLocked,
    isLocked: record.isLocked,
    attempts: record.attempts,
    retryAfterSeconds: record.retryAfterSeconds ?? undefined,
  };
}

/**
 * CONCURRENCY & LOCKING INVARIANT:
 * All database operations that write to the `LoginAttempt` table (`recordFailedAttempt`,
 * `claimAuthAndCreateSession`, and `resetRateLimit`) MUST execute inside a PostgreSQL
 * transaction that first acquires the transaction-scoped advisory lock:
 *   `await tx.$queryRaw<unknown[]>`SELECT pg_advisory_xact_lock(hashtext(${identifier}));`;`
 *
 * This protocol serializes all cooperating writers on that identifier in PostgreSQL shared
 * memory BEFORE any query plan execution or timestamp capture occurs.
 *
 * NOTE: The guarantee that CTE timestamps are completely fresh and experience zero row-lock
 * wait skew applies strictly to cooperating writers adhering to this protocol.
 */

/**
 * Atomically records a failed login attempt in PostgreSQL.
 *
 * Concurrency & Timestamp Guarantees:
 * - Acquires `pg_advisory_xact_lock(hashtext(identifier))` to serialize concurrent writers.
 * - Captures `clock_timestamp()` exactly once in a CTE (`WITH ts AS ...`) after the lock is held.
 * - Derives both `isLocked` and `retryAfterSeconds` from that single captured timestamp.
 * - Enforces the 5-attempt threshold atomically.
 * - Preserves active `lockedUntil` timestamps (no lockout extension on subsequent pings).
 * - Resets attempts to 1 if the 15-minute inactivity idle window has elapsed or previous lock expired.
 *
 * @param email - The user's input email address.
 * @param clientIp - The client's IP address.
 * @returns RateLimitResult reflecting the database-authoritative post-update state.
 */
export async function recordFailedAttempt(
  email: string,
  clientIp: string
): Promise<RateLimitResult> {
  const id = crypto.randomUUID();
  const identifier = createRateLimitIdentifier(email, clientIp);

  return prisma.$transaction(async (tx) => {
    // 1. Cooperative transaction-scoped advisory lock using tx.$queryRaw
    await tx.$queryRaw<unknown[]>`SELECT pg_advisory_xact_lock(hashtext(${identifier}));`;

    // 2. Atomic CTE UPSERT with single authoritative database timestamp
    const rows = await tx.$queryRaw<Array<{
      attempts: number;
      lockedUntil: Date | null;
      updatedAt: Date;
      isLocked: boolean;
      retryAfterSeconds: number | null;
    }>>`
      WITH ts AS (
        SELECT clock_timestamp() AS now_ts
      ),
      updated AS (
        INSERT INTO "LoginAttempt" ("id", "identifier", "attempts", "lockedUntil", "updatedAt")
        VALUES (${id}, ${identifier}, 1, NULL, (SELECT now_ts FROM ts))
        ON CONFLICT ("identifier") DO UPDATE
        SET
          -- 1. Atomic Lockout Evaluation
          "lockedUntil" = CASE
            -- Active lockout in progress: DO NOT EXTEND. Preserve exact existing lockedUntil.
            WHEN "LoginAttempt"."lockedUntil" IS NOT NULL AND "LoginAttempt"."lockedUntil" > (SELECT now_ts FROM ts)
              THEN "LoginAttempt"."lockedUntil"
            -- Lockout expired OR idle inactivity window elapsed (> 15m idle): Clear lockout.
            WHEN ("LoginAttempt"."lockedUntil" IS NOT NULL AND "LoginAttempt"."lockedUntil" <= (SELECT now_ts FROM ts))
                 OR ("LoginAttempt"."updatedAt" < ((SELECT now_ts FROM ts) - INTERVAL '15 minutes'))
              THEN NULL
            -- Threshold reached (current attempts + 1 >= 5): Trigger lockout until now_ts + 15m.
            WHEN ("LoginAttempt"."attempts" + 1) >= ${MAX_FAILED_ATTEMPTS}
              THEN ((SELECT now_ts FROM ts) + INTERVAL '15 minutes')
            -- Below threshold: No lockout.
            ELSE NULL
          END,

          -- 2. Atomic Counter Evaluation
          "attempts" = CASE
            -- Active lockout in progress: DO NOT INCREMENT. Keep existing count.
            WHEN "LoginAttempt"."lockedUntil" IS NOT NULL AND "LoginAttempt"."lockedUntil" > (SELECT now_ts FROM ts)
              THEN "LoginAttempt"."attempts"
            -- Lockout expired OR idle inactivity window elapsed (> 15m idle): Reset to 1 (this attempt).
            WHEN ("LoginAttempt"."lockedUntil" IS NOT NULL AND "LoginAttempt"."lockedUntil" <= (SELECT now_ts FROM ts))
                 OR ("LoginAttempt"."updatedAt" < ((SELECT now_ts FROM ts) - INTERVAL '15 minutes'))
              THEN 1
            -- Normal increment below or at threshold.
            ELSE "LoginAttempt"."attempts" + 1
          END,

          "updatedAt" = (SELECT now_ts FROM ts)
        RETURNING "attempts", "lockedUntil", "updatedAt"
      )
      SELECT
        u."attempts",
        u."lockedUntil",
        u."updatedAt",
        (u."lockedUntil" IS NOT NULL AND u."lockedUntil" > ts.now_ts) AS "isLocked",
        CASE
          WHEN u."lockedUntil" IS NOT NULL AND u."lockedUntil" > ts.now_ts
            THEN GREATEST(1, CEIL(EXTRACT(EPOCH FROM (u."lockedUntil" - ts.now_ts))))::int
          ELSE NULL
        END AS "retryAfterSeconds"
      FROM updated u, ts;
    `;

    const record = rows[0];
    return {
      allowed: !record.isLocked,
      isLocked: record.isLocked,
      attempts: record.attempts,
      retryAfterSeconds: record.retryAfterSeconds ?? undefined,
    };
  });
}

/**
 * Atomically verifies that no active lockout occurred while password verification was in flight,
 * resets the attempt counter to 0 (never deleting the row), and inserts the Session record within
 * the SAME PostgreSQL transaction.
 *
 * Implements Option A rollback: If an active lockout is detected, throws `ConcurrentLockoutError`,
 * causing a real PostgreSQL transaction ROLLBACK. Zero Session rows are inserted, and the error
 * is caught and returned cleanly as `{ success: false, isLocked: true }`.
 *
 * @param userId - The verified user ID.
 * @param email - The verified email.
 * @param clientIp - The validated client IP.
 * @returns AuthClaimResult with created Session and rawToken, or lockout failure.
 */
export async function claimAuthAndCreateSession(
  userId: string,
  email: string,
  clientIp: string
): Promise<AuthClaimResult> {
  const id = crypto.randomUUID();
  const identifier = createRateLimitIdentifier(email, clientIp);
  const rawToken = generateSessionToken();
  const tokenHash = hashSessionToken(rawToken);

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Cooperative transaction-scoped advisory lock using tx.$queryRaw
      await tx.$queryRaw<unknown[]>`SELECT pg_advisory_xact_lock(hashtext(${identifier}));`;

      // 2. Claim CTE UPSERT: resets attempts to 0 if not locked; preserves lock if active
      const rows = await tx.$queryRaw<Array<{
        attempts: number;
        lockedUntil: Date | null;
        updatedAt: Date;
        isLocked: boolean;
        retryAfterSeconds: number | null;
      }>>`
        WITH ts AS (
          SELECT clock_timestamp() AS now_ts
        ),
        updated AS (
          INSERT INTO "LoginAttempt" ("id", "identifier", "attempts", "lockedUntil", "updatedAt")
          VALUES (${id}, ${identifier}, 0, NULL, (SELECT now_ts FROM ts))
          ON CONFLICT ("identifier") DO UPDATE
          SET
            -- 1. Preserve active lockout if present; clear only if expired or null
            "lockedUntil" = CASE
              WHEN "LoginAttempt"."lockedUntil" IS NOT NULL AND "LoginAttempt"."lockedUntil" > (SELECT now_ts FROM ts)
                THEN "LoginAttempt"."lockedUntil"
              ELSE NULL
            END,

            -- 2. Preserve attempts if actively locked; reset to 0 if successfully claimed
            "attempts" = CASE
              WHEN "LoginAttempt"."lockedUntil" IS NOT NULL AND "LoginAttempt"."lockedUntil" > (SELECT now_ts FROM ts)
                THEN "LoginAttempt"."attempts"
              ELSE 0
            END,

            "updatedAt" = (SELECT now_ts FROM ts)
          RETURNING "attempts", "lockedUntil", "updatedAt"
        )
        SELECT
          u."attempts",
          u."lockedUntil",
          u."updatedAt",
          (u."lockedUntil" IS NOT NULL AND u."lockedUntil" > ts.now_ts) AS "isLocked",
          CASE
            WHEN u."lockedUntil" IS NOT NULL AND u."lockedUntil" > ts.now_ts
              THEN GREATEST(1, CEIL(EXTRACT(EPOCH FROM (u."lockedUntil" - ts.now_ts))))::int
            ELSE NULL
          END AS "retryAfterSeconds"
        FROM updated u, ts;
      `;

      const record = rows[0];

      // Option A: Trigger real PostgreSQL transaction ROLLBACK on concurrent lockout
      if (record.isLocked) {
        throw new ConcurrentLockoutError(record.retryAfterSeconds ?? 900);
      }

      // 3. Authorized: Insert Session inside the SAME transaction
      const now = new Date();
      const expiresAt = new Date(now.getTime() + INACTIVITY_LIFETIME_MS);

      const session = await tx.session.create({
        data: {
          userId,
          tokenHash,
          expiresAt,
          lastActiveAt: now,
          createdAt: now,
        },
        include: {
          user: {
            select: { id: true, email: true, name: true, role: true },
          },
        },
      });

      return {
        success: true,
        isLocked: false,
        rawToken,
        session: {
          id: session.id,
          userId: session.userId,
          expiresAt: session.expiresAt,
          createdAt: session.createdAt,
          lastActiveAt: session.lastActiveAt,
          user: session.user,
        },
      };
    });
  } catch (error) {
    if (error instanceof ConcurrentLockoutError) {
      // Cleanly return the lockout state without bubbling the internal rollback error
      return {
        success: false,
        isLocked: true,
        retryAfterSeconds: error.retryAfterSeconds,
      };
    }
    // Re-throw unexpected infrastructure failures
    throw error;
  }
}

/**
 * Resets the attempt counter and clears lockouts for a given identifier.
 * Primarily intended for administrative password resets or testing.
 * Cooperates with the transaction-scoped advisory lock.
 *
 * @param email - The user's email address.
 * @param clientIp - The client's IP address.
 */
export async function resetRateLimit(email: string, clientIp: string): Promise<void> {
  const id = crypto.randomUUID();
  const identifier = createRateLimitIdentifier(email, clientIp);

  await prisma.$transaction(async (tx) => {
    // 1. Cooperative advisory lock using tx.$queryRaw
    await tx.$queryRaw<unknown[]>`SELECT pg_advisory_xact_lock(hashtext(${identifier}));`;

    // 2. Atomic reset preserving the row as a permanent synchronization anchor
    await tx.$queryRaw<unknown[]>`
      INSERT INTO "LoginAttempt" ("id", "identifier", "attempts", "lockedUntil", "updatedAt")
      VALUES (${id}, ${identifier}, 0, NULL, clock_timestamp())
      ON CONFLICT ("identifier") DO UPDATE
      SET "attempts" = 0, "lockedUntil" = NULL, "updatedAt" = clock_timestamp();
    `;
  });
}
