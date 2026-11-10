/**
 * Authoritative Pricing and Shipping Configuration
 *
 * All monetary amounts are defined in integer cents to ensure precision
 * and eliminate IEEE 754 floating-point rounding inaccuracies.
 */
export const PRICING_CONFIG = {
  /** Illustrative demo sales tax rate (8.0%) calculated on cart subtotal */
  TAX_RATE: 0.08,

  /** Standard shipping cost in integer cents ($5.00) */
  STANDARD_SHIPPING_CENTS: 500,

  /** Free standard shipping threshold in integer cents ($75.00) */
  FREE_SHIPPING_THRESHOLD_CENTS: 7500,
} as const;

export type PricingConfig = typeof PRICING_CONFIG;
