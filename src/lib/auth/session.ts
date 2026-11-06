import 'server-only';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';

/**
 * Cookie name based on environment:
 * In production, the `__Host-` prefix enforces `Secure: true`, `Path: /`, and no `Domain` attribute.
 * In development, `auth_session` is used to allow testing over plain HTTP on localhost.
 */
export const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === 'production' ? '__Host-auth_session' : 'auth_session';

/**
 * 7 days in seconds: 7 * 24 * 60 * 60 = 604,800 seconds.
 */
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

/**
 * 32 bytes of cryptographic randomness represented as a 64-character hexadecimal string.
 */
const HEX_TOKEN_REGEX = /^[0-9a-fA-F]{64}$/;

/**
 * Validates that maxAgeSeconds is a non-negative, finite integer.
 *
 * @param seconds - The lifetime in seconds.
 * @returns A safe, non-negative integer.
 * @throws {TypeError} If seconds is not a number.
 * @throws {RangeError} If seconds is negative, NaN, or not finite.
 */
export function validateMaxAgeSeconds(seconds: number): number {
  if (typeof seconds !== 'number') {
    throw new TypeError('Cookie maxAge must be a number.');
  }

  if (!Number.isFinite(seconds) || Number.isNaN(seconds)) {
    throw new RangeError('Cookie maxAge must be a finite number.');
  }

  if (seconds < 0) {
    throw new RangeError('Cookie maxAge must not be negative.');
  }

  return Math.floor(seconds);
}

/**
 * Returns standard cookie configuration options for session cookies.
 *
 * @param maxAgeSeconds - Optional lifetime in seconds, defaults to 7 days (SESSION_MAX_AGE_SECONDS).
 * @throws {TypeError} If maxAgeSeconds is not a number when provided.
 * @throws {RangeError} If maxAgeSeconds is negative, NaN, or not finite.
 */
export function getSessionCookieOptions(maxAgeSeconds?: number) {
  const isProduction = process.env.NODE_ENV === 'production';
  const resolvedMaxAge =
    maxAgeSeconds !== undefined
      ? validateMaxAgeSeconds(maxAgeSeconds)
      : SESSION_MAX_AGE_SECONDS;

  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProduction,
    path: '/',
    maxAge: resolvedMaxAge,
  };
}

/**
 * Generates a cryptographically secure random session token.
 *
 * @returns A 64-character lowercase hexadecimal string (256 bits of entropy).
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Computes a SHA-256 hash of a raw session token for database storage.
 * Validates that the input is a valid 64-character hexadecimal session token before hashing.
 *
 * @param token - The raw 64-character hexadecimal session token to hash.
 * @returns The 64-character lowercase hexadecimal SHA-256 digest.
 * @throws {TypeError} If token is not a string.
 * @throws {Error} If token is not a valid 64-character hexadecimal string.
 */
export function hashSessionToken(token: string): string {
  if (typeof token !== 'string') {
    throw new TypeError('Session token must be a string.');
  }

  if (!HEX_TOKEN_REGEX.test(token)) {
    throw new Error('Session token must be a valid 64-character hexadecimal string.');
  }

  return crypto.createHash('sha256').update(token.toLowerCase()).digest('hex');
}

/**
 * Sets the raw session token into an HttpOnly cookie using the asynchronous Next.js 16 cookies API.
 *
 * @param token - The raw 64-character hexadecimal session token.
 * @param maxAgeSeconds - Optional remaining lifetime in seconds, defaults to 7 days.
 * @throws {TypeError} If token is not a string.
 * @throws {Error} If token is not a valid 64-character hexadecimal string.
 */
export async function setSessionCookie(token: string, maxAgeSeconds?: number): Promise<void> {
  if (typeof token !== 'string') {
    throw new TypeError('Session token must be a string.');
  }

  if (!HEX_TOKEN_REGEX.test(token)) {
    throw new Error('Session token must be a valid 64-character hexadecimal string.');
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions(maxAgeSeconds));
}

/**
 * Reads the session token from the incoming request cookie using the asynchronous Next.js 16 cookies API.
 *
 * @returns The raw session token if present, or null if not found.
 */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE_NAME);
  return cookie?.value ?? null;
}

/**
 * Reliably clears the active environment's session cookie using maxAge: 0 and matching options.
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    ...getSessionCookieOptions(0),
    maxAge: 0,
  });
}
