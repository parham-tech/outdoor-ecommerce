import { describe, it, expect } from 'vitest';
import {
  resolveStockAvailability,
  MAX_FRONTEND_ORDER_LIMIT,
} from './stockResolution';

describe('stockResolution — resolveStockAvailability', () => {
  it('identifies explicit out-of-stock when inStock is false', () => {
    const stock = resolveStockAvailability({ inStock: false });
    expect(stock.isAvailable).toBe(false);
    expect(stock.maxSelectableQuantity).toBe(0);
    expect(stock.statusReason).toBe('Out of stock');
  });

  it('identifies out-of-stock when inventory is 0', () => {
    const stock = resolveStockAvailability({ inStock: true, inventory: 0 });
    expect(stock.isAvailable).toBe(false);
    expect(stock.maxSelectableQuantity).toBe(0);
    expect(stock.hasExactInventory).toBe(true);
    expect(stock.exactInventory).toBe(0);
  });

  it('identifies out-of-stock when inventory is negative', () => {
    const stock = resolveStockAvailability({ inventory: -5 });
    expect(stock.isAvailable).toBe(false);
    expect(stock.maxSelectableQuantity).toBe(0);
  });

  it('resolves exact numerical inventory when positive integer', () => {
    const stock = resolveStockAvailability({ inStock: true, inventory: 4 });
    expect(stock.isAvailable).toBe(true);
    expect(stock.maxSelectableQuantity).toBe(4);
    expect(stock.hasExactInventory).toBe(true);
    expect(stock.exactInventory).toBe(4);
  });

  it('applies MAX_FRONTEND_ORDER_LIMIT when inStock is true without numerical inventory', () => {
    const stock = resolveStockAvailability({ inStock: true });
    expect(stock.isAvailable).toBe(true);
    expect(stock.maxSelectableQuantity).toBe(MAX_FRONTEND_ORDER_LIMIT);
    expect(stock.hasExactInventory).toBe(false);
  });

  it('defaults to available with frontend cap when empty product object is passed', () => {
    const stock = resolveStockAvailability({});
    expect(stock.isAvailable).toBe(true);
    expect(stock.maxSelectableQuantity).toBe(MAX_FRONTEND_ORDER_LIMIT);
  });
});
