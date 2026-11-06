import 'server-only';
import { prisma } from '@/lib/db/prisma';
import {
  generateSessionToken,
  hashSessionToken,
  setSessionCookie,
  getSessionToken,
  clearSessionCookie,
} from './session';

/**
 * 7 days in milliseconds: 7 * 24 * 60 * 60 * 1000 = 604,800,000 ms.
 */
export const INACTIVITY_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * 30 days in milliseconds: 30 * 24 * 60 * 60 * 1000 = 2,592,000,000 ms.
 */
export const ABSOLUTE_SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * 15 minutes in milliseconds: 15 * 60 * 1000 = 900,000 ms.
 * Minimum interval between database sliding expiration updates.
 */
export const REFRESH_INTERVAL_MS = 15 * 60 * 1000;

/**
 * 64-character hexadecimal regex for session token validation.
 */
const HEX_TOKEN_REGEX = /^[0-9a-fA-F]{64}$/;

/**
 * Sanitized user details projected for authenticated consumers.
 * NOTE: The current Prisma User schema does not support account suspension / active status flags.
 */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'ADMIN';
}

/**
 * Sanitized session representation returned to callers.
 * Raw tokens and token hashes are never exposed.
 */
export interface CurrentSession {
  id: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  lastActiveAt: Date;
  user: SessionUser;
}

/**
 * Validates and retrieves the current session from the incoming request cookie in a strictly read-only manner.
 * Safe to invoke from React Server Components, layouts, Server Actions, and Route Handlers.
 *
 * Next.js Cookie Mutation Restriction:
 * This function performs zero cookie modifications (no set or delete) and zero database writes,
 * ensuring complete safety during GET/SSR rendering where cookie mutations are forbidden.
 *
 * @returns The active sanitized CurrentSession if valid, or null if missing, invalid, or expired.
 */
export async function getCurrentSession(): Promise<CurrentSession | null> {
  const rawToken = await getSessionToken();
  if (!rawToken || !HEX_TOKEN_REGEX.test(rawToken)) {
    return null;
  }

  const tokenHash = hashSessionToken(rawToken);

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
  });

  if (!session || !session.user) {
    return null;
  }

  const nowMs = Date.now();

  // Inactivity expiration check: session unused for more than 7 days
  if (nowMs >= session.expiresAt.getTime()) {
    return null;
  }

  // Absolute expiration check: session older than 30 days from creation
  const absoluteExpiryMs = session.createdAt.getTime() + ABSOLUTE_SESSION_LIFETIME_MS;
  if (nowMs >= absoluteExpiryMs) {
    return null;
  }

  return {
    id: session.id,
    userId: session.userId,
    expiresAt: session.expiresAt,
    createdAt: session.createdAt,
    lastActiveAt: session.lastActiveAt,
    user: session.user,
  };
}

/**
 * Creates a new database session record and writes the HTTP-only cookie.
 * Must only be invoked from mutation contexts (Server Actions or Route Handlers).
 *
 * @param userId - The user ID to bind to the new session.
 * @returns The newly created sanitized CurrentSession.
 * @throws {TypeError} If userId is not a string.
 * @throws {Error} If userId is empty, database creation fails, cookie setting fails, or rollback fails.
 */
export async function createSession(userId: string): Promise<CurrentSession> {
  if (typeof userId !== 'string') {
    throw new TypeError('User ID must be a string.');
  }

  if (userId.trim().length === 0) {
    throw new Error('User ID must not be empty.');
  }

  const rawToken = generateSessionToken();
  const tokenHash = hashSessionToken(rawToken);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + INACTIVITY_LIFETIME_MS);

  const session = await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      lastActiveAt: now,
      createdAt: now,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
  });

  try {
    await setSessionCookie(rawToken);
  } catch {
    // Attempt rollback: delete newly created DB session to prevent orphaned active session
    let rollbackError: unknown = null;
    try {
      await prisma.session.delete({ where: { id: session.id } });
    } catch (err) {
      rollbackError = err;
    }

    if (rollbackError) {
      throw new Error('Failed to set session cookie, and database session rollback also failed.');
    }

    throw new Error('Failed to set session cookie.');
  }

  return {
    id: session.id,
    userId: session.userId,
    expiresAt: session.expiresAt,
    createdAt: session.createdAt,
    lastActiveAt: session.lastActiveAt,
    user: session.user,
  };
}

/**
 * Extends the session inactivity expiration in the database and synchronizes the browser cookie.
 *
 * Security Requirements:
 * - Reads the current request's raw token internally via `getSessionToken()`.
 * - Validates format and hashes via `hashSessionToken()`.
 * - Never accepts an arbitrary session ID or unrelated raw token from the caller.
 * - Includes `tokenHash` in the atomic `updateMany` condition, alongside:
 *   `id`, `expiresAt: { gt: now }`, and `lastActiveAt: { lte: refreshThreshold }`.
 * - Only updates the cookie using the same raw token read from the current request.
 * - If the atomic update count is 0, the cookie is not extended.
 *
 * Must only be invoked from mutation contexts (Server Actions or Route Handlers).
 *
 * @returns true if the session and cookie were refreshed; false if throttled, expired, missing, or aborted.
 */
export async function refreshSession(): Promise<boolean> {
  const rawToken = await getSessionToken();
  if (!rawToken || !HEX_TOKEN_REGEX.test(rawToken)) {
    return false;
  }

  const tokenHash = hashSessionToken(rawToken);

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      createdAt: true,
      lastActiveAt: true,
      expiresAt: true,
    },
  });

  if (!session) {
    return false;
  }

  const nowMs = Date.now();

  // 15-minute throttle check: skip database writes if active within 15 minutes
  const refreshThresholdMs = nowMs - REFRESH_INTERVAL_MS;
  if (session.lastActiveAt.getTime() > refreshThresholdMs) {
    return false;
  }

  // Absolute 30-day cap check: session cannot exceed 30 days from creation
  const absoluteExpiryMs = session.createdAt.getTime() + ABSOLUTE_SESSION_LIFETIME_MS;
  if (nowMs >= absoluteExpiryMs) {
    return false;
  }

  // Inactivity expiration check: session unused for more than 7 days
  if (nowMs >= session.expiresAt.getTime()) {
    return false;
  }

  // Calculate synchronized target expiration bounded by 30-day absolute limit
  const targetExpiryMs = Math.min(nowMs + INACTIVITY_LIFETIME_MS, absoluteExpiryMs);
  const newExpiresAt = new Date(targetExpiryMs);
  const refreshThreshold = new Date(refreshThresholdMs);
  const now = new Date(nowMs);

  // Atomic update with strict token-to-session binding and concurrency guards:
  // - id & tokenHash: guarantees the token belongs strictly to this session
  // - expiresAt > now: ensures session is not expired or concurrently deleted
  // - lastActiveAt <= refreshThreshold: ensures concurrent requests do not bypass 15m throttle
  const result = await prisma.session.updateMany({
    where: {
      id: session.id,
      tokenHash,
      expiresAt: { gt: now },
      lastActiveAt: { lte: refreshThreshold },
    },
    data: {
      lastActiveAt: now,
      expiresAt: newExpiresAt,
    },
  });

  if (result.count === 0) {
    // Another concurrent request updated it first or session was deleted/expired.
    // Do not extend the cookie.
    return false;
  }

  // Synchronize browser cookie with the exact remaining bounded lifetime (seconds)
  const remainingSeconds = Math.max(0, Math.floor((targetExpiryMs - nowMs) / 1000));
  await setSessionCookie(rawToken, remainingSeconds);

  return true;
}

/**
 * Deletes the database session corresponding to the current request's session cookie and clears the cookie.
 *
 * Error Handling:
 * - Always attempts to clear the browser cookie, even if database deletion fails.
 * - Does not silently swallow database deletion errors.
 * - Propagates a safe, non-sensitive error to the caller after cookie cleanup.
 * - Ensures a cookie-clearing error does not hide an earlier database deletion error.
 * - Deletes only the session identified by the current request's token hash.
 *
 * Must only be invoked from mutation contexts (Server Actions or Route Handlers).
 *
 * @throws {Error} If database deletion or cookie cleanup fails.
 */
export async function deleteSession(): Promise<void> {
  let dbError: unknown = null;

  try {
    const rawToken = await getSessionToken();
    if (rawToken && HEX_TOKEN_REGEX.test(rawToken)) {
      const tokenHash = hashSessionToken(rawToken);
      await prisma.session.deleteMany({
        where: { tokenHash },
      });
    }
  } catch (error) {
    dbError = error;
  }

  // Always attempt to clear the browser cookie
  let cookieError: unknown = null;
  try {
    await clearSessionCookie();
  } catch (error) {
    cookieError = error;
  }

  if (dbError && cookieError) {
    throw new Error('Failed to delete session from database, and cookie cleanup also encountered an error.');
  }

  if (dbError) {
    throw new Error('Failed to delete session from database.');
  }

  if (cookieError) {
    throw new Error('Failed to clear session cookie.');
  }
}
