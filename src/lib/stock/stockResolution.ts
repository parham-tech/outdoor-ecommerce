import type { StockResolution } from '../../types/cart';

/**
 * Temporary Frontend-Only Demonstration Order Limit.
 *
 * NOTE ON STOCK POLICY:
 * This limit serves exclusively as a client-side UX guardrail to prevent unreasonable
 * input quantities during demonstration. It is explicitly NOT a representation of
 * actual warehouse inventory. Storefront ProductDetail models expose `inStock: boolean`;
 * exact numerical inventory is honored only if provided by the authoritative storefront source.
 */
export const MAX_FRONTEND_ORDER_LIMIT = 10;

/**
 * Isolated stock resolution helper.
 *
 * Resolves availability and maximum selectable quantity from authoritative storefront product data.
 * Pure utility isolated to allow future backend API replacement without modifying UI components.
 */
export function resolveStockAvailability(product: {
  inStock?: boolean;
  inventory?: number;
}): StockResolution {
  // 1. Explicit out of stock via boolean flag or non-positive numerical inventory
  if (product.inStock === false || (typeof product.inventory === 'number' && product.inventory <= 0)) {
    return {
      isAvailable: false,
      maxSelectableQuantity: 0,
      hasExactInventory: typeof product.inventory === 'number',
      exactInventory: typeof product.inventory === 'number' ? Math.max(0, product.inventory) : undefined,
      statusReason: 'Out of stock',
    };
  }

  // 2. Authoritative numerical inventory provided by storefront source
  if (
    typeof product.inventory === 'number' &&
    Number.isInteger(product.inventory) &&
    product.inventory > 0
  ) {
    return {
      isAvailable: true,
      maxSelectableQuantity: product.inventory,
      hasExactInventory: true,
      exactInventory: product.inventory,
    };
  }

  // 3. Storefront boolean availability (inStock === true without numerical count)
  return {
    isAvailable: true,
    maxSelectableQuantity: MAX_FRONTEND_ORDER_LIMIT,
    hasExactInventory: false,
    statusReason: 'Sample availability (frontend order cap applied)',
  };
}
