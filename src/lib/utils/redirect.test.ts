import { describe, it, expect } from 'vitest';
import { getSafeInternalRedirect } from './redirect';

describe('getSafeInternalRedirect', () => {
  describe('valid internal paths', () => {
    it('accepts standard internal relative paths', () => {
      expect(getSafeInternalRedirect('/account')).toBe('/account');
      expect(getSafeInternalRedirect('/account/orders')).toBe('/account/orders');
      expect(getSafeInternalRedirect('/checkout')).toBe('/checkout');
      expect(getSafeInternalRedirect('/shop')).toBe('/shop');
    });

    it('preserves query parameters and hash fragments on internal paths', () => {
      expect(getSafeInternalRedirect('/account/orders?status=PENDING#receipt')).toBe(
        '/account/orders?status=PENDING#receipt'
      );
      expect(getSafeInternalRedirect('/checkout?step=payment')).toBe('/checkout?step=payment');
    });

    it('trims leading and trailing whitespace from valid paths', () => {
      expect(getSafeInternalRedirect('  /checkout  ')).toBe('/checkout');
    });
  });

  describe('external and protocol-relative URL rejection', () => {
    it('rejects absolute http and https URLs', () => {
      expect(getSafeInternalRedirect('https://evil.com')).toBe('/account');
      expect(getSafeInternalRedirect('http://evil.com')).toBe('/account');
      expect(getSafeInternalRedirect('https://evil.com/phishing')).toBe('/account');
    });

    it('rejects protocol-relative URLs (//evil.com)', () => {
      expect(getSafeInternalRedirect('//evil.com')).toBe('/account');
      expect(getSafeInternalRedirect('//evil.com/path')).toBe('/account');
      expect(getSafeInternalRedirect('///evil.com')).toBe('/account');
    });
  });

  describe('backslash bypass rejection (WHATWG normalization)', () => {
    it('rejects paths starting with forward slash followed by backslash (/\\)', () => {
      expect(getSafeInternalRedirect('/\\evil.com')).toBe('/account');
      expect(getSafeInternalRedirect('/\\/\\evil.com')).toBe('/account');
    });

    it('rejects paths containing backslashes anywhere in the string', () => {
      expect(getSafeInternalRedirect('/account\\orders')).toBe('/account');
      expect(getSafeInternalRedirect('/checkout\\..\\evil.com')).toBe('/account');
    });
  });

  describe('dangerous schemes and non-path inputs', () => {
    it('rejects javascript: and data: schemes', () => {
      expect(getSafeInternalRedirect('javascript:alert(1)')).toBe('/account');
      expect(getSafeInternalRedirect('data:text/html,<script>alert(1)</script>')).toBe('/account');
      expect(getSafeInternalRedirect('vbscript:msgbox(1)')).toBe('/account');
    });

    it('falls back to default on empty or whitespace strings', () => {
      expect(getSafeInternalRedirect('')).toBe('/account');
      expect(getSafeInternalRedirect('   ')).toBe('/account');
    });

    it('falls back to default on null and undefined', () => {
      expect(getSafeInternalRedirect(null)).toBe('/account');
      expect(getSafeInternalRedirect(undefined)).toBe('/account');
    });
  });

  describe('custom fallback behavior', () => {
    it('uses provided custom fallback when target is invalid or malicious', () => {
      expect(getSafeInternalRedirect('https://evil.com', '/shop')).toBe('/shop');
      expect(getSafeInternalRedirect('', '/custom-fallback')).toBe('/custom-fallback');
      expect(getSafeInternalRedirect('/\\evil.com', '/fallback')).toBe('/fallback');
    });
  });
});
