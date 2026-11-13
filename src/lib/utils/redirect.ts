/**
 * Redirect Sanitization Utility — ALTITUDE
 *
 * Ensures redirect URLs are strictly internal, same-origin relative paths.
 * Protects against Open Redirect vulnerabilities (CWE-601) via:
 * - Absolute external URLs (e.g. `https://evil.com`)
 * - Protocol-relative paths (e.g. `//evil.com`)
 * - Backslash normalization escapes (e.g. `/\evil.com` or `/\\evil.com` in WHATWG URL resolution)
 * - Dangerous non-HTTP schemes (e.g. `javascript:`, `data:`)
 */

/**
 * Validates that a redirect destination is strictly an internal, same-origin relative path.
 * Falls back safely to `fallback` (default: '/account') on invalid or external targets.
 *
 * @param url Raw untrusted redirect string from query parameters
 * @param fallback Safe internal fallback destination
 */
export function getSafeInternalRedirect(
  url: string | null | undefined,
  fallback = '/account'
): string {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();

  // Reject paths that don't start with '/' or attempt protocol-relative/backslash escapes
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) {
    return fallback;
  }

  // WHATWG validation against a fixed internal base origin
  try {
    const parsed = new URL(trimmed, 'https://altitude.local');
    if (parsed.origin !== 'https://altitude.local') {
      return fallback;
    }
    // Return sanitized relative pathname + search + hash
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return fallback;
  }
}
