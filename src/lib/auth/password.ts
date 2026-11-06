import 'server-only';
import bcrypt from 'bcryptjs';

const BCRYPT_SALT_ROUNDS = 12;
const MAX_PASSWORD_BYTES = 72;

/**
 * Pre-computed bcrypt hash with 12 salt rounds ($2a$12$).
 * Used to execute structural timing mitigation when an email is not found,
 * ensuring the password verification work factor is computed even for non-existent users
 * to mitigate side-channel account enumeration attacks.
 *
 * NOTE: This provides structural algorithmic mitigation rather than a constant-time execution
 * guarantee or guaranteed equal duration, as system load and input variations can introduce
 * minor timing differences.
 */
export const DUMMY_HASH = '$2a$12$pShLufY/a519/X1r4vNPiOD0RlIjQHAoPbmgkreQWyeBwX8oSlaEK';

/**
 * Hashes a plaintext password using bcrypt with 12 salt rounds.
 *
 * @param password - The plaintext password to hash.
 * @returns A Promise resolving to the bcrypt hash string.
 * @throws {TypeError} If password is not a string.
 * @throws {Error} If password is empty or exceeds the maximum supported length of 72 bytes.
 */
export async function hashPassword(password: string): Promise<string> {
  if (typeof password !== 'string') {
    throw new TypeError('Password must be a string.');
  }

  if (password.length === 0) {
    throw new Error('Password must not be empty.');
  }

  if (Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_BYTES) {
    throw new Error(`Password must not exceed ${MAX_PASSWORD_BYTES} bytes.`);
  }

  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

/**
 * Verifies a plaintext password against a bcrypt hash with work-factor computation.
 *
 * @param password - The plaintext password to verify.
 * @param hash - The bcrypt hash to verify against.
 * @returns A Promise resolving to true if the password matches the hash, false otherwise.
 * @throws {TypeError} If password or hash is not a string.
 * @throws {Error} If password or hash is empty, or if password exceeds the maximum supported length of 72 bytes.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (typeof password !== 'string') {
    throw new TypeError('Password must be a string.');
  }

  if (password.length === 0) {
    throw new Error('Password must not be empty.');
  }

  if (Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_BYTES) {
    throw new Error(`Password must not exceed ${MAX_PASSWORD_BYTES} bytes.`);
  }

  if (typeof hash !== 'string') {
    throw new TypeError('Hash must be a string.');
  }

  if (hash.length === 0) {
    throw new Error('Hash must not be empty.');
  }

  return bcrypt.compare(password, hash);
}
