import { PRICING_CONFIG } from '../../config/pricing';

export interface CartPricingSummary {
  /** Cart items subtotal in integer cents */
  subtotalInCents: number;

  /** Estimated sales tax in integer cents */
  taxInCents: number;

  /** Standard shipping fee in integer cents ($5.00 or $0.00 if qualified/empty) */
  shippingInCents: number;

  /** Grand total in integer cents (subtotal + tax + shipping) */
  totalInCents: number;

  /** Remaining amount in integer cents needed to unlock free standard shipping */
  remainingForFreeShippingInCents: number;

  /** Free shipping progress percentage (0 to 100) */
  freeShippingProgress: number;

  /** Whether the cart subtotal qualifies for free standard shipping */
  qualifiesForFreeShipping: boolean;

  /** The free shipping threshold in integer cents */
  freeShippingThresholdInCents: number;
}

export interface PricingItemInput {
  priceInCents: number;
  quantity: number;
}

/**
 * Validates that an amount is a non-negative, finite safe integer in cents.
 */
function validateMonetaryCents(cents: number, paramName: string): void {
  if (typeof cents !== 'number' || Number.isNaN(cents) || !Number.isFinite(cents)) {
    throw new TypeError(`${paramName} must be a valid finite number.`);
  }
  if (!Number.isSafeInteger(cents)) {
    if (!Number.isInteger(cents)) {
      throw new TypeError(`${paramName} must be an integer representing cents.`);
    }
    throw new RangeError(`${paramName} must be a safe integer representing cents.`);
  }
  if (cents < 0) {
    throw new RangeError(`${paramName} cannot be negative.`);
  }
}

/**
 * Calculates the total subtotal in cents from an array of cart items.
 */
export function calculateSubtotal(items: readonly PricingItemInput[]): number {
  if (!Array.isArray(items)) {
    throw new TypeError('Cart items must be provided as an array.');
  }

  let subtotal = 0;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item || typeof item !== 'object') {
      throw new TypeError(`Cart item at index ${i} is invalid.`);
    }
    validateMonetaryCents(item.priceInCents, `Item price at index ${i}`);

    if (
      typeof item.quantity !== 'number' ||
      Number.isNaN(item.quantity) ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 0
    ) {
      throw new RangeError(`Item quantity at index ${i} must be a non-negative safe integer.`);
    }

    const itemTotal = item.priceInCents * item.quantity;
    if (!Number.isSafeInteger(itemTotal) || !Number.isSafeInteger(subtotal + itemTotal)) {
      throw new RangeError('Subtotal calculation resulted in an arithmetic overflow.');
    }

    subtotal += itemTotal;
  }

  return subtotal;
}

/**
 * Calculates estimated sales tax on the cart subtotal using integer-cent half-up rounding.
 * Tax is calculated strictly on the subtotal, not on shipping.
 */
export function calculateTax(
  subtotalInCents: number,
  taxRate: number = PRICING_CONFIG.TAX_RATE
): number {
  validateMonetaryCents(subtotalInCents, 'Subtotal');

  if (typeof taxRate !== 'number' || Number.isNaN(taxRate)) {
    throw new TypeError('Tax rate must be a valid number.');
  }

  if (!Number.isFinite(taxRate) || taxRate < 0) {
    throw new RangeError('Tax rate must be a non-negative finite number.');
  }

  if (subtotalInCents === 0) {
    return 0;
  }

  const rawTax = subtotalInCents * taxRate;
  if (!Number.isFinite(rawTax) || rawTax > Number.MAX_SAFE_INTEGER) {
    throw new RangeError('Tax calculation resulted in an arithmetic overflow.');
  }

  const taxInCents = Math.round(rawTax);
  if (!Number.isSafeInteger(taxInCents)) {
    throw new RangeError('Tax calculation resulted in an arithmetic overflow.');
  }

  return taxInCents;
}

/**
 * Calculates standard shipping cost based on the subtotal and free shipping threshold.
 * - Empty cart: $0.00
 * - Subtotal >= threshold: $0.00 (FREE)
 * - Subtotal < threshold: $5.00 (STANDARD_SHIPPING_CENTS)
 */
export function calculateStandardShipping(
  subtotalInCents: number,
  thresholdInCents: number = PRICING_CONFIG.FREE_SHIPPING_THRESHOLD_CENTS
): number {
  validateMonetaryCents(subtotalInCents, 'Subtotal');
  validateMonetaryCents(thresholdInCents, 'Threshold');

  if (subtotalInCents === 0) {
    return 0;
  }

  return subtotalInCents >= thresholdInCents ? 0 : PRICING_CONFIG.STANDARD_SHIPPING_CENTS;
}

/**
 * Calculates remaining amount in cents needed to reach the free shipping threshold.
 * Never returns a negative amount.
 */
export function calculateRemainingForFreeShipping(
  subtotalInCents: number,
  thresholdInCents: number = PRICING_CONFIG.FREE_SHIPPING_THRESHOLD_CENTS
): number {
  validateMonetaryCents(subtotalInCents, 'Subtotal');
  validateMonetaryCents(thresholdInCents, 'Threshold');

  return Math.max(0, thresholdInCents - subtotalInCents);
}

/**
 * Calculates free shipping progress percentage (0 - 100).
 * Capped at 99% if the subtotal is under the threshold to avoid misleading users.
 */
export function calculateFreeShippingProgress(
  subtotalInCents: number,
  thresholdInCents: number = PRICING_CONFIG.FREE_SHIPPING_THRESHOLD_CENTS
): number {
  validateMonetaryCents(subtotalInCents, 'Subtotal');
  validateMonetaryCents(thresholdInCents, 'Threshold');

  if (subtotalInCents === 0 || thresholdInCents === 0) {
    return 0;
  }

  if (subtotalInCents >= thresholdInCents) {
    return 100;
  }

  const rawProgress = Math.round((subtotalInCents / thresholdInCents) * 100);
  return Math.min(99, Math.max(0, rawProgress));
}

/**
 * Computes a complete, immutable pricing summary from subtotal in cents or cart items.
 */
export function calculateCartPricing(
  input: number | readonly PricingItemInput[],
  thresholdInCents: number = PRICING_CONFIG.FREE_SHIPPING_THRESHOLD_CENTS
): CartPricingSummary {
  const subtotalInCents = typeof input === 'number' ? input : calculateSubtotal(input);

  validateMonetaryCents(subtotalInCents, 'Subtotal');
  validateMonetaryCents(thresholdInCents, 'Threshold');

  const qualifiesForFreeShipping = subtotalInCents >= thresholdInCents;
  const remainingForFreeShippingInCents = calculateRemainingForFreeShipping(subtotalInCents, thresholdInCents);
  const freeShippingProgress = calculateFreeShippingProgress(subtotalInCents, thresholdInCents);
  const shippingInCents = calculateStandardShipping(subtotalInCents, thresholdInCents);
  const taxInCents = calculateTax(subtotalInCents);
  const totalInCents = subtotalInCents + taxInCents + shippingInCents;
  if (!Number.isSafeInteger(totalInCents)) {
    throw new RangeError('Total calculation resulted in an arithmetic overflow.');
  }

  return {
    subtotalInCents,
    taxInCents,
    shippingInCents,
    totalInCents,
    remainingForFreeShippingInCents,
    freeShippingProgress,
    qualifiesForFreeShipping,
    freeShippingThresholdInCents: thresholdInCents,
  };
}
