import { describe, it, expect, vi } from 'vitest';

vi.mock('@/data/shopCatalog', async () => {
  return await import('../data/shopCatalog');
});
vi.mock('@/data/productDetails', async () => {
  return await import('../data/productDetails');
});
vi.mock('@/lib/pricing/cartPricing', async () => {
  return await import('../lib/pricing/cartPricing');
});

import {
  createCartItemId,
  isValidQuantity,
  resolveStockAvailability,
  validateProductAndOptions,
  MAX_FRONTEND_ORDER_LIMIT,
} from './CartContext';
import { formatCurrency } from '../lib/utils/format';

describe('CartContext Domain Helpers', () => {
  describe('createCartItemId', () => {
    it('generates a clean identifier for a product without options', () => {
      expect(createCartItemId('prod-1')).toBe('prod-1');
    });

    it('trims leading and trailing whitespace from the product ID', () => {
      expect(createCartItemId('  prod-1  ')).toBe('prod-1');
    });

    it('handles empty string or missing ID gracefully', () => {
      expect(createCartItemId('')).toBe('');
      // @ts-expect-error Testing edge case undefined ID
      expect(createCartItemId(undefined)).toBe('');
    });

    it('formats a single color option in lowercase', () => {
      expect(createCartItemId('prod-1', 'Olive')).toBe('prod-1?color=olive');
      expect(createCartItemId('prod-1', '  SAND  ')).toBe('prod-1?color=sand');
    });

    it('formats a single capacity option with URL percent-encoding', () => {
      expect(createCartItemId('prod-1', undefined, '2 person')).toBe('prod-1?capacity=2+person');
      expect(createCartItemId('prod-1', '', '  45L  ')).toBe('prod-1?capacity=45l');
    });

    it('sorts parameters alphabetically so color and capacity produce canonical identifiers regardless of input order', () => {
      // In URLSearchParams, 'capacity' comes before 'color' alphabetically
      const id1 = createCartItemId('prod-alpha-2p-tent', 'Olive', '2 person');
      expect(id1).toBe('prod-alpha-2p-tent?capacity=2+person&color=olive');

      // Whitespace around options is trimmed and lowercased
      const id2 = createCartItemId('prod-alpha-2p-tent', '  olive  ', '  2 PERSON  ');
      expect(id2).toBe('prod-alpha-2p-tent?capacity=2+person&color=olive');
      expect(id1).toBe(id2);
    });

    it('ignores empty or whitespace-only options', () => {
      expect(createCartItemId('prod-1', '   ', '')).toBe('prod-1');
      expect(createCartItemId('prod-1', undefined, '   ')).toBe('prod-1');
    });

    it('encodes special characters safely', () => {
      expect(createCartItemId('prod-1', 'blue/green', '100% cotton')).toBe(
        'prod-1?capacity=100%25+cotton&color=blue%2Fgreen'
      );
    });
  });

  describe('isValidQuantity', () => {
    it('accepts positive integers greater than or equal to 1', () => {
      expect(isValidQuantity(1)).toBe(true);
      expect(isValidQuantity(2)).toBe(true);
      expect(isValidQuantity(10)).toBe(true);
      expect(isValidQuantity(999)).toBe(true);
    });

    it('rejects zero and negative numbers', () => {
      expect(isValidQuantity(0)).toBe(false);
      expect(isValidQuantity(-1)).toBe(false);
      expect(isValidQuantity(-100)).toBe(false);
    });

    it('rejects floating-point numbers', () => {
      expect(isValidQuantity(1.5)).toBe(false);
      expect(isValidQuantity(0.99)).toBe(false);
      expect(isValidQuantity(2.0001)).toBe(false);
    });

    it('rejects NaN, Infinity, and -Infinity', () => {
      expect(isValidQuantity(NaN)).toBe(false);
      expect(isValidQuantity(Infinity)).toBe(false);
      expect(isValidQuantity(-Infinity)).toBe(false);
    });

    it('rejects non-numeric types', () => {
      expect(isValidQuantity('1')).toBe(false);
      expect(isValidQuantity('5')).toBe(false);
      expect(isValidQuantity(null)).toBe(false);
      expect(isValidQuantity(undefined)).toBe(false);
      expect(isValidQuantity({})).toBe(false);
      expect(isValidQuantity([])).toBe(false);
      expect(isValidQuantity(true)).toBe(false);
      expect(isValidQuantity(false)).toBe(false);
    });
  });

  describe('resolveStockAvailability', () => {
    it('exports MAX_FRONTEND_ORDER_LIMIT as 10', () => {
      expect(MAX_FRONTEND_ORDER_LIMIT).toBe(10);
    });

    it('resolves as out of stock when inStock is explicitly false', () => {
      const result = resolveStockAvailability({ inStock: false });
      expect(result).toEqual({
        isAvailable: false,
        maxSelectableQuantity: 0,
        hasExactInventory: false,
        exactInventory: undefined,
        statusReason: 'Out of stock',
      });
    });

    it('resolves as out of stock when numerical inventory is 0 or negative', () => {
      const zeroInv = resolveStockAvailability({ inStock: true, inventory: 0 });
      expect(zeroInv).toEqual({
        isAvailable: false,
        maxSelectableQuantity: 0,
        hasExactInventory: true,
        exactInventory: 0,
        statusReason: 'Out of stock',
      });

      const negInv = resolveStockAvailability({ inStock: true, inventory: -3 });
      expect(negInv).toEqual({
        isAvailable: false,
        maxSelectableQuantity: 0,
        hasExactInventory: true,
        exactInventory: 0,
        statusReason: 'Out of stock',
      });
    });

    it('resolves authoritative numerical inventory when positive integer', () => {
      const result = resolveStockAvailability({ inStock: true, inventory: 5 });
      expect(result).toEqual({
        isAvailable: true,
        maxSelectableQuantity: 5,
        hasExactInventory: true,
        exactInventory: 5,
      });

      const resultSingle = resolveStockAvailability({ inventory: 1 });
      expect(resultSingle).toEqual({
        isAvailable: true,
        maxSelectableQuantity: 1,
        hasExactInventory: true,
        exactInventory: 1,
      });
    });

    it('falls back to sample availability with MAX_FRONTEND_ORDER_LIMIT when inStock is true without inventory count', () => {
      const result = resolveStockAvailability({ inStock: true });
      expect(result).toEqual({
        isAvailable: true,
        maxSelectableQuantity: MAX_FRONTEND_ORDER_LIMIT,
        hasExactInventory: false,
        statusReason: 'Sample availability (frontend order cap applied)',
      });
    });

    it('falls back to sample availability when inventory is non-integer or undefined', () => {
      const resultFloat = resolveStockAvailability({ inStock: true, inventory: 4.5 });
      expect(resultFloat).toEqual({
        isAvailable: true,
        maxSelectableQuantity: MAX_FRONTEND_ORDER_LIMIT,
        hasExactInventory: false,
        statusReason: 'Sample availability (frontend order cap applied)',
      });

      const resultEmpty = resolveStockAvailability({});
      expect(resultEmpty).toEqual({
        isAvailable: true,
        maxSelectableQuantity: MAX_FRONTEND_ORDER_LIMIT,
        hasExactInventory: false,
        statusReason: 'Sample availability (frontend order cap applied)',
      });
    });
  });

  describe('validateProductAndOptions', () => {
    it('rejects payloads with missing slug or productId', () => {
      const missingSlug = validateProductAndOptions({
        productId: 'prod-alpha-2p-tent',
        slug: '',
        quantity: 1,
      });
      expect(missingSlug.isValid).toBe(false);
      expect(missingSlug.error).toBe('Product ID and slug are required.');

      const missingId = validateProductAndOptions({
        productId: '',
        slug: 'alpha-2-person-tent',
        quantity: 1,
      });
      expect(missingId.isValid).toBe(false);
      expect(missingId.error).toBe('Product ID and slug are required.');
    });

    it('rejects products that do not exist in the catalog', () => {
      const nonExistent = validateProductAndOptions({
        productId: 'prod-non-existent',
        slug: 'non-existent-product-slug',
        quantity: 1,
      });
      expect(nonExistent.isValid).toBe(false);
      expect(nonExistent.error).toBe('Product not found in catalog.');
    });

    it('rejects payloads where productId does not match the catalog slug', () => {
      const mismatch = validateProductAndOptions({
        productId: 'prod-mismatched-id',
        slug: 'alpha-2-person-tent',
        quantity: 1,
      });
      expect(mismatch.isValid).toBe(false);
      expect(mismatch.error).toBe('Product ID does not match catalog slug.');
    });

    it('validates and normalizes valid product with matching options', () => {
      const result = validateProductAndOptions({
        productId: 'prod-alpha-2p-tent',
        slug: 'alpha-2-person-tent',
        quantity: 1,
        selectedColor: 'Olive',
        selectedCapacity: '2 person',
      });
      expect(result.isValid).toBe(true);
      expect(result.product).toBeDefined();
      expect(result.product?.name).toBe('Alpha 2-person Tent');
      expect(result.normalizedColor).toBe('Olive');
      expect(result.normalizedCapacity).toBe('2 person');
      expect(result.error).toBeUndefined();
    });

    it('normalizes options case-insensitively with trimming', () => {
      const result = validateProductAndOptions({
        productId: 'prod-alpha-2p-tent',
        slug: 'alpha-2-person-tent',
        quantity: 1,
        selectedColor: '  sand  ',
        selectedCapacity: '  2 PERSON  ',
      });
      expect(result.isValid).toBe(true);
      expect(result.normalizedColor).toBe('Sand');
      expect(result.normalizedCapacity).toBe('2 person');
    });

    it('rejects unavailable color option', () => {
      const result = validateProductAndOptions({
        productId: 'prod-alpha-2p-tent',
        slug: 'alpha-2-person-tent',
        quantity: 1,
        selectedColor: 'Neon Purple',
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Color "Neon Purple" is not available for Alpha 2-person Tent.');
    });

    it('rejects unavailable capacity option', () => {
      const result = validateProductAndOptions({
        productId: 'prod-alpha-2p-tent',
        slug: 'alpha-2-person-tent',
        quantity: 1,
        selectedCapacity: '8 person family dome',
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Option "8 person family dome" is not available for Alpha 2-person Tent.');
    });

    it('allows omitting optional variant selections when not specified', () => {
      const result = validateProductAndOptions({
        productId: 'prod-alpha-2p-tent',
        slug: 'alpha-2-person-tent',
        quantity: 1,
      });
      expect(result.isValid).toBe(true);
      expect(result.normalizedColor).toBeUndefined();
      expect(result.normalizedCapacity).toBeUndefined();
    });
  });

  describe('formatCurrency', () => {
    it('formats 0 cents correctly as $0.00', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('formats standard dollar amounts correctly', () => {
      expect(formatCurrency(500)).toBe('$5.00');
      expect(formatCurrency(1500)).toBe('$15.00');
      expect(formatCurrency(7500)).toBe('$75.00');
      expect(formatCurrency(32900)).toBe('$329.00');
    });

    it('formats cents values correctly', () => {
      expect(formatCurrency(99)).toBe('$0.99');
      expect(formatCurrency(1234)).toBe('$12.34');
      expect(formatCurrency(5)).toBe('$0.05');
    });

    it('formats thousands with commas', () => {
      expect(formatCurrency(100000)).toBe('$1,000.00');
      expect(formatCurrency(1250000)).toBe('$12,500.00');
    });
  });
});
