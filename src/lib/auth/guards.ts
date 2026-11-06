import 'server-only';
import { getCurrentSession, type CurrentSession } from './session-service';

/**
 * Thrown when an unauthenticated request attempts to access a protected resource (HTTP 401).
 */
export class AuthenticationError extends Error {
  readonly statusCode = 401;

  constructor(message = 'Authentication required.') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Thrown when an authenticated user lacks the required role or permissions (HTTP 403).
 */
export class AuthorizationError extends Error {
  readonly statusCode = 403;

  constructor(message = 'Forbidden: Administrative privileges required.') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Thrown when an underlying database error, connection pool exhaustion, or service failure
 * prevents session verification (HTTP 503).
 * Prevents classifying infrastructure outages as credential or authorization failures.
 */
export class ServiceUnavailableError extends Error {
  readonly statusCode = 503;

  constructor(message = 'Authentication service temporarily unavailable.') {
    super(message);
    this.name = 'ServiceUnavailableError';
  }
}

/**
 * Asserts that the provided session is non-null, unexpired, and possesses an active ADMIN role.
 * Pure assertion helper suitable for Server Components or services where a session
 * is already in memory.
 *
 * @param session - The CurrentSession object or null.
 * @returns The guaranteed non-null, unexpired CurrentSession with role === 'ADMIN'.
 * @throws {AuthenticationError} If session is null or expired (HTTP 401).
 * @throws {AuthorizationError} If session user role is not ADMIN (HTTP 403).
 */
export function assertAdmin(session: CurrentSession | null): CurrentSession {
  if (!session || session.expiresAt.getTime() <= Date.now()) {
    throw new AuthenticationError();
  }

  if (session.user.role !== 'ADMIN') {
    throw new AuthorizationError();
  }

  return session;
}

/**
 * Reusable server-side guard that validates the current request's session against the database.
 * Completely decoupled from UI redirects: returns the active CurrentSession or throws a typed error.
 *
 * Calling Contexts:
 * - Server Components: Catch error and invoke Next.js `redirect('/admin/login')`.
 * - Server Actions: Catch error and return `{ success: false, error: error.message }`.
 * - Route Handlers: Catch error and return `NextResponse.json({ error: error.message }, { status: error.statusCode })`.
 *
 * @returns A Promise resolving to the active, validated CurrentSession.
 * @throws {AuthenticationError} If no active session exists or the session has expired (401).
 * @throws {ServiceUnavailableError} If the database query encounters an unexpected failure (503).
 */
export async function requireAuthenticatedUser(): Promise<CurrentSession> {
  let session: CurrentSession | null = null;

  try {
    session = await getCurrentSession();
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
      throw error;
    }
    throw new ServiceUnavailableError();
  }

  if (!session) {
    throw new AuthenticationError();
  }

  return session;
}

/**
 * Reusable server-side guard that enforces an active administrator session.
 * Validates the user's current database role on every request rather than trusting stale cookie data.
 *
 * @returns A Promise resolving to the active CurrentSession guaranteed to have user.role === 'ADMIN'.
 * @throws {AuthenticationError} If unauthenticated or expired (401).
 * @throws {AuthorizationError} If authenticated but user role is not ADMIN (403).
 * @throws {ServiceUnavailableError} If the database query fails (503).
 */
export async function requireAdmin(): Promise<CurrentSession> {
  const session = await requireAuthenticatedUser();

  if (session.user.role !== 'ADMIN') {
    throw new AuthorizationError();
  }

  return session;
}
