import { describe, it, expect } from 'vitest';
import {
  calculateSubtotal,
  calculateTax,
  calculateStandardShipping,
  calculateExpressShipping,
  calculateShipping,
  calculateRemainingForFreeShipping,
  calculateFreeShippingProgress,
  calculateCartPricing,
  validateShippingTier,
} from './cartPricing';
import { PRICING_CONFIG } from '../../config/pricing';

describe('cartPricing utility', () => {
  describe('calculateSubtotal', () => {
    it('calculates subtotal correctly for empty array', () => {
      expect(calculateSubtotal([])).toBe(0);
    });

    it('calculates subtotal correctly for single item', () => {
      expect(calculateSubtotal([{ priceInCents: 4500, quantity: 1 }])).toBe(4500);
      expect(calculateSubtotal([{ priceInCents: 1500, quantity: 3 }])).toBe(4500);
    });

    it('calculates subtotal correctly for multiple items', () => {
      const items = [
        { priceInCents: 1500, quantity: 2 }, // 3000
        { priceInCents: 2000, quantity: 1 }, // 2000
        { priceInCents: 2500, quantity: 1 }, // 2500
      ];
      expect(calculateSubtotal(items)).toBe(7500);
    });

    it('rejects invalid item structures or non-array inputs', () => {
      // @ts-expect-error Testing runtime invalid input
      expect(() => calculateSubtotal(null)).toThrow(TypeError);
      // @ts-expect-error Testing runtime invalid input
      expect(() => calculateSubtotal('invalid')).toThrow(TypeError);
      // @ts-expect-error Testing runtime invalid input
      expect(() => calculateSubtotal([null])).toThrow(TypeError);
    });

    it('rejects negative prices, non-integer prices, and invalid quantities', () => {
      expect(() => calculateSubtotal([{ priceInCents: -100, quantity: 1 }])).toThrow(RangeError);
      expect(() => calculateSubtotal([{ priceInCents: 12.5, quantity: 1 }])).toThrow(TypeError);
      expect(() => calculateSubtotal([{ priceInCents: 1000, quantity: -1 }])).toThrow(RangeError);
      expect(() => calculateSubtotal([{ priceInCents: 1000, quantity: 1.5 }])).toThrow(RangeError);
      expect(() => calculateSubtotal([{ priceInCents: NaN, quantity: 1 }])).toThrow(TypeError);
    });

    it('rejects unsafe integer prices or quantities', () => {
      expect(() => calculateSubtotal([{ priceInCents: Number.MAX_SAFE_INTEGER + 1, quantity: 1 }])).toThrow(RangeError);
      expect(() => calculateSubtotal([{ priceInCents: 1000, quantity: Number.MAX_SAFE_INTEGER + 1 }])).toThrow(RangeError);
    });

    it('rejects subtotal arithmetic overflow', () => {
      expect(() => calculateSubtotal([{ priceInCents: Number.MAX_SAFE_INTEGER, quantity: 2 }])).toThrow(RangeError);
      expect(() => calculateSubtotal([
        { priceInCents: Number.MAX_SAFE_INTEGER, quantity: 1 },
        { priceInCents: 1, quantity: 1 },
      ])).toThrow(RangeError);
    });
  });

  describe('calculateTax', () => {
    it('returns 0 for empty cart (0 cents subtotal)', () => {
      expect(calculateTax(0)).toBe(0);
    });

    it('calculates 8% tax accurately', () => {
      // $45.00 * 0.08 = $3.60 (360 cents)
      expect(calculateTax(4500)).toBe(360);
      // $75.00 * 0.08 = $6.00 (600 cents)
      expect(calculateTax(7500)).toBe(600);
      // $120.00 * 0.08 = $9.60 (960 cents)
      expect(calculateTax(12000)).toBe(960);
    });

    it('implements half-up integer rounding accurately', () => {
      // 1231 cents * 0.08 = 98.48 -> 98 cents
      expect(calculateTax(1231)).toBe(98);
      // 1232 cents * 0.08 = 98.56 -> 99 cents
      expect(calculateTax(1232)).toBe(99);
      // 7499 cents * 0.08 = 599.92 -> 600 cents
      expect(calculateTax(7499)).toBe(600);
    });

    it('rejects negative, floating, or non-finite subtotal values', () => {
      expect(() => calculateTax(-100)).toThrow(RangeError);
      expect(() => calculateTax(45.5)).toThrow(TypeError);
      expect(() => calculateTax(NaN)).toThrow(TypeError);
      expect(() => calculateTax(Infinity)).toThrow(TypeError);
    });

    it('validates tax rate strictly and rejects non-numbers, negative, NaN, and infinities', () => {
      expect(() => calculateTax(1000, Infinity)).toThrow(RangeError);
      expect(() => calculateTax(1000, -Infinity)).toThrow(RangeError);
      expect(() => calculateTax(1000, -0.05)).toThrow(RangeError);
      expect(() => calculateTax(1000, NaN)).toThrow(TypeError);
      // @ts-expect-error Testing runtime invalid input
      expect(() => calculateTax(1000, '0.08')).toThrow(TypeError);
      // @ts-expect-error Testing runtime invalid input
      expect(() => calculateTax(1000, null)).toThrow(TypeError);
    });

    it('rejects unsafe integer subtotal for tax calculation', () => {
      expect(() => calculateTax(Number.MAX_SAFE_INTEGER + 1)).toThrow(RangeError);
    });

    it('detects tax calculation arithmetic overflow before rounding when raw tax exceeds safe integer range', () => {
      expect(() => calculateTax(Number.MAX_SAFE_INTEGER, 1.5)).toThrow(RangeError);
      expect(() => calculateTax(Number.MAX_SAFE_INTEGER, 2)).toThrow(RangeError);
    });
  });

  describe('calculateStandardShipping', () => {
    it('returns 0 for empty cart (0 cents)', () => {
      expect(calculateStandardShipping(0)).toBe(0);
    });

    it('charges standard shipping ($5.00 / 500 cents) below threshold', () => {
      expect(calculateStandardShipping(4500)).toBe(PRICING_CONFIG.STANDARD_SHIPPING_CENTS);
      expect(calculateStandardShipping(7499)).toBe(PRICING_CONFIG.STANDARD_SHIPPING_CENTS);
    });

    it('waives shipping ($0.00) at exact threshold and above', () => {
      // Exact boundary ($75.00)
      expect(calculateStandardShipping(PRICING_CONFIG.FREE_SHIPPING_THRESHOLD_CENTS)).toBe(0);
      // Above boundary ($120.00)
      expect(calculateStandardShipping(12000)).toBe(0);
    });

    it('rejects negative or invalid input values', () => {
      expect(() => calculateStandardShipping(-500)).toThrow(RangeError);
      expect(() => calculateStandardShipping(NaN)).toThrow(TypeError);
    });

    it('rejects unsafe integer subtotal or threshold', () => {
      expect(() => calculateStandardShipping(Number.MAX_SAFE_INTEGER + 1)).toThrow(RangeError);
      expect(() => calculateStandardShipping(1000, Number.MAX_SAFE_INTEGER + 1)).toThrow(RangeError);
    });
  });

  describe('calculateShipping and calculateExpressShipping', () => {
    it('returns 0 for empty cart (0 cents) on both standard and express tiers', () => {
      expect(calculateShipping(0, 'standard')).toBe(0);
      expect(calculateShipping(0, 'express')).toBe(0);
      expect(calculateExpressShipping(0)).toBe(0);
    });

    it('calculates standard tier shipping accurately ($5 below threshold, $0 at or above)', () => {
      expect(calculateShipping(4500, 'standard')).toBe(PRICING_CONFIG.STANDARD_SHIPPING_CENTS);
      expect(calculateShipping(7500, 'standard')).toBe(0);
      expect(calculateShipping(12000, 'standard')).toBe(0);
    });

    it('calculates express tier shipping ($15.00 / 1500 cents) below threshold', () => {
      expect(calculateShipping(4500, 'express')).toBe(PRICING_CONFIG.EXPRESS_SHIPPING_CENTS);
      expect(calculateExpressShipping(4500)).toBe(PRICING_CONFIG.EXPRESS_SHIPPING_CENTS);
    });

    it('charges express shipping ($15.00 / 1500 cents) even at or above the $75 threshold (never waived)', () => {
      // Exact threshold ($75.00)
      expect(calculateShipping(7500, 'express')).toBe(PRICING_CONFIG.EXPRESS_SHIPPING_CENTS);
      expect(calculateExpressShipping(7500)).toBe(PRICING_CONFIG.EXPRESS_SHIPPING_CENTS);

      // Above threshold ($120.00)
      expect(calculateShipping(12000, 'express')).toBe(PRICING_CONFIG.EXPRESS_SHIPPING_CENTS);
      expect(calculateExpressShipping(12000)).toBe(PRICING_CONFIG.EXPRESS_SHIPPING_CENTS);
    });

    it('defaults to standard tier when shippingTier is omitted', () => {
      expect(calculateShipping(4500)).toBe(PRICING_CONFIG.STANDARD_SHIPPING_CENTS);
      expect(calculateShipping(7500)).toBe(0);
    });

    it('rejects unsupported shipping tier with RangeError', () => {
      // @ts-expect-error Testing invalid runtime tier
      expect(() => calculateShipping(4500, 'overnight')).toThrow(RangeError);
      // @ts-expect-error Testing invalid runtime tier
      expect(() => calculateShipping(4500, 'priority')).toThrow(RangeError);
    });

    it('rejects non-string shipping tier with TypeError', () => {
      // @ts-expect-error Testing invalid runtime tier
      expect(() => calculateShipping(4500, null)).toThrow(TypeError);
      // @ts-expect-error Testing invalid runtime tier
      expect(() => calculateShipping(4500, 123)).toThrow(TypeError);
      // @ts-expect-error Testing invalid runtime tier
      expect(() => calculateShipping(4500, false)).toThrow(TypeError);
    });

    it('rejects negative or invalid input values for express shipping', () => {
      expect(() => calculateShipping(-500, 'express')).toThrow(RangeError);
      expect(() => calculateShipping(NaN, 'express')).toThrow(TypeError);
      expect(() => calculateExpressShipping(-500)).toThrow(RangeError);
      expect(() => calculateExpressShipping(NaN)).toThrow(TypeError);
    });

    it('validates shipping tier using validateShippingTier helper', () => {
      expect(() => validateShippingTier('standard')).not.toThrow();
      expect(() => validateShippingTier('express')).not.toThrow();
      expect(() => validateShippingTier('overnight')).toThrow(RangeError);
      expect(() => validateShippingTier(null)).toThrow(TypeError);
    });
  });

  describe('calculateRemainingForFreeShipping', () => {
    it('returns threshold amount when subtotal is 0', () => {
      expect(calculateRemainingForFreeShipping(0)).toBe(PRICING_CONFIG.FREE_SHIPPING_THRESHOLD_CENTS);
    });

    it('returns correct remaining cents below threshold', () => {
      // $75.00 - $45.00 = $30.00 (3000 cents)
      expect(calculateRemainingForFreeShipping(4500)).toBe(3000);
      // $75.00 - $74.99 = $0.01 (1 cent)
      expect(calculateRemainingForFreeShipping(7499)).toBe(1);
    });

    it('returns 0 when subtotal reaches or exceeds threshold (never negative)', () => {
      expect(calculateRemainingForFreeShipping(7500)).toBe(0);
      expect(calculateRemainingForFreeShipping(12000)).toBe(0);
    });

    it('rejects unsafe integer subtotal or threshold', () => {
      expect(() => calculateRemainingForFreeShipping(Number.MAX_SAFE_INTEGER + 1)).toThrow(RangeError);
      expect(() => calculateRemainingForFreeShipping(1000, Number.MAX_SAFE_INTEGER + 1)).toThrow(RangeError);
    });
  });

  describe('calculateFreeShippingProgress', () => {
    it('returns 0 for 0 subtotal', () => {
      expect(calculateFreeShippingProgress(0)).toBe(0);
    });

    it('calculates correct progress below threshold', () => {
      // 4500 / 7500 = 60%
      expect(calculateFreeShippingProgress(4500)).toBe(60);
    });

    it('caps progress at 99% when subtotal is 1 cent below threshold', () => {
      expect(calculateFreeShippingProgress(7499)).toBe(99);
    });

    it('returns 100% when threshold is met or exceeded', () => {
      expect(calculateFreeShippingProgress(7500)).toBe(100);
      expect(calculateFreeShippingProgress(12000)).toBe(100);
    });

    it('rejects unsafe integer subtotal or threshold', () => {
      expect(() => calculateFreeShippingProgress(Number.MAX_SAFE_INTEGER + 1)).toThrow(RangeError);
      expect(() => calculateFreeShippingProgress(1000, Number.MAX_SAFE_INTEGER + 1)).toThrow(RangeError);
    });
  });

  describe('calculateCartPricing (comprehensive summary)', () => {
    it('computes correctly for Empty Cart', () => {
      const pricing = calculateCartPricing(0);
      expect(pricing).toEqual({
        subtotalInCents: 0,
        taxInCents: 0,
        shippingInCents: 0,
        totalInCents: 0,
        remainingForFreeShippingInCents: 7500,
        freeShippingProgress: 0,
        qualifiesForFreeShipping: false,
        freeShippingThresholdInCents: 7500,
        shippingTier: 'standard',
      });
    });

    it('computes correctly for Single Item below threshold ($45.00)', () => {
      const pricing = calculateCartPricing(4500);
      expect(pricing).toEqual({
        subtotalInCents: 4500,
        taxInCents: 360, // $3.60
        shippingInCents: 500, // $5.00
        totalInCents: 5360, // $53.60
        remainingForFreeShippingInCents: 3000, // $30.00
        freeShippingProgress: 60,
        qualifiesForFreeShipping: false,
        freeShippingThresholdInCents: 7500,
        shippingTier: 'standard',
      });
    });

    it('computes correctly from cart items array (multiple items)', () => {
      const items = [
        { priceInCents: 1500, quantity: 2 }, // 3000
        { priceInCents: 2000, quantity: 1 }, // 2000
      ];
      const pricing = calculateCartPricing(items);
      expect(pricing.subtotalInCents).toBe(5000); // $50.00
      expect(pricing.taxInCents).toBe(400); // $4.00
      expect(pricing.shippingInCents).toBe(500); // $5.00
      expect(pricing.totalInCents).toBe(5900); // $59.00
      expect(pricing.remainingForFreeShippingInCents).toBe(2500); // $25.00
      expect(pricing.qualifiesForFreeShipping).toBe(false);
      expect(pricing.shippingTier).toBe('standard');
    });

    it('computes correctly for Exact Threshold ($75.00)', () => {
      const pricing = calculateCartPricing(7500);
      expect(pricing).toEqual({
        subtotalInCents: 7500,
        taxInCents: 600, // $6.00
        shippingInCents: 0, // FREE
        totalInCents: 8100, // $81.00
        remainingForFreeShippingInCents: 0,
        freeShippingProgress: 100,
        qualifiesForFreeShipping: true,
        freeShippingThresholdInCents: 7500,
        shippingTier: 'standard',
      });
    });

    it('computes correctly for One Cent Below Threshold ($74.99)', () => {
      const pricing = calculateCartPricing(7499);
      expect(pricing).toEqual({
        subtotalInCents: 7499,
        taxInCents: 600, // $6.00 (599.92 rounded)
        shippingInCents: 500, // $5.00
        totalInCents: 8599, // $85.99
        remainingForFreeShippingInCents: 1, // $0.01
        freeShippingProgress: 99,
        qualifiesForFreeShipping: false,
        freeShippingThresholdInCents: 7500,
        shippingTier: 'standard',
      });
    });

    it('computes correctly for Above Threshold ($120.00)', () => {
      const pricing = calculateCartPricing(12000);
      expect(pricing).toEqual({
        subtotalInCents: 12000,
        taxInCents: 960, // $9.60
        shippingInCents: 0, // FREE
        totalInCents: 12960, // $129.60
        remainingForFreeShippingInCents: 0,
        freeShippingProgress: 100,
        qualifiesForFreeShipping: true,
        freeShippingThresholdInCents: 7500,
        shippingTier: 'standard',
      });
    });

    it('handles Large Monetary Values ($10,000.00)', () => {
      const pricing = calculateCartPricing(1000000); // 1,000,000 cents = $10,000.00
      expect(pricing.subtotalInCents).toBe(1000000);
      expect(pricing.taxInCents).toBe(80000); // $800.00
      expect(pricing.shippingInCents).toBe(0); // FREE
      expect(pricing.totalInCents).toBe(1080000); // $10,800.00
      expect(pricing.qualifiesForFreeShipping).toBe(true);
      expect(pricing.remainingForFreeShippingInCents).toBe(0);
      expect(pricing.freeShippingProgress).toBe(100);
      expect(pricing.shippingTier).toBe('standard');
    });

    it('computes correctly for Empty Cart with Express Shipping', () => {
      const pricing = calculateCartPricing(0, 'express');
      expect(pricing).toEqual({
        subtotalInCents: 0,
        taxInCents: 0,
        shippingInCents: 0,
        totalInCents: 0,
        remainingForFreeShippingInCents: 7500,
        freeShippingProgress: 0,
        qualifiesForFreeShipping: false,
        freeShippingThresholdInCents: 7500,
        shippingTier: 'express',
      });
    });

    it('computes correctly for Single Item below threshold ($45.00) with Express Shipping', () => {
      const pricing = calculateCartPricing(4500, 'express');
      expect(pricing).toEqual({
        subtotalInCents: 4500,
        taxInCents: 360, // $3.60 (8% of $45)
        shippingInCents: 1500, // $15.00 flat
        totalInCents: 6360, // $45.00 + $3.60 + $15.00 = $63.60
        remainingForFreeShippingInCents: 3000, // $30.00
        freeShippingProgress: 60,
        qualifiesForFreeShipping: false,
        freeShippingThresholdInCents: 7500,
        shippingTier: 'express',
      });
    });

    it('computes correctly from cart items array with Express Shipping', () => {
      const items = [
        { priceInCents: 1500, quantity: 2 }, // 3000
        { priceInCents: 2000, quantity: 1 }, // 2000
      ];
      const pricing = calculateCartPricing(items, 'express');
      expect(pricing.subtotalInCents).toBe(5000); // $50.00
      expect(pricing.taxInCents).toBe(400); // $4.00
      expect(pricing.shippingInCents).toBe(1500); // $15.00
      expect(pricing.totalInCents).toBe(6900); // $69.00
      expect(pricing.shippingTier).toBe('express');
    });

    it('computes correctly for Exact Threshold ($75.00) with Express Shipping (never waived)', () => {
      const pricing = calculateCartPricing(7500, 'express');
      expect(pricing).toEqual({
        subtotalInCents: 7500,
        taxInCents: 600, // $6.00 (8% of $75)
        shippingInCents: 1500, // $15.00 (NOT waived)
        totalInCents: 9600, // $75.00 + $6.00 + $15.00 = $96.00
        remainingForFreeShippingInCents: 0,
        freeShippingProgress: 100,
        qualifiesForFreeShipping: true,
        freeShippingThresholdInCents: 7500,
        shippingTier: 'express',
      });
    });

    it('computes correctly for Above Threshold ($120.00) with Express Shipping', () => {
      const pricing = calculateCartPricing(12000, 'express');
      expect(pricing).toEqual({
        subtotalInCents: 12000,
        taxInCents: 960, // $9.60 (8% of $120)
        shippingInCents: 1500, // $15.00 (NOT waived)
        totalInCents: 14460, // $120.00 + $9.60 + $15.00 = $144.60
        remainingForFreeShippingInCents: 0,
        freeShippingProgress: 100,
        qualifiesForFreeShipping: true,
        freeShippingThresholdInCents: 7500,
        shippingTier: 'express',
      });
    });

    it('demonstrates that tax is calculated strictly on product subtotal, not shipping', () => {
      const standard = calculateCartPricing(4500, 'standard');
      const express = calculateCartPricing(4500, 'express');

      // Both must calculate exactly $3.60 (360 cents) tax on $45.00 subtotal
      expect(standard.taxInCents).toBe(360);
      expect(express.taxInCents).toBe(360);

      // Grand totals differ strictly by the shipping differential ($15.00 - $5.00 = $10.00)
      expect(standard.totalInCents).toBe(5360); // $53.60
      expect(express.totalInCents).toBe(6360); // $63.60
      expect(express.totalInCents - standard.totalInCents).toBe(1000); // 1000 cents ($10.00)
    });

    it('defaults to Standard Shipping when shipping tier parameter is omitted', () => {
      const defaultPricing = calculateCartPricing(4500);
      expect(defaultPricing.shippingTier).toBe('standard');
      expect(defaultPricing.shippingInCents).toBe(500);
      expect(defaultPricing.totalInCents).toBe(5360);
    });

    it('rejects unsupported shipping tier with RangeError', () => {
      // @ts-expect-error Testing invalid runtime tier
      expect(() => calculateCartPricing(4500, 'overnight')).toThrow(RangeError);
      // @ts-expect-error Testing invalid runtime tier
      expect(() => calculateCartPricing(4500, 'same-day')).toThrow(RangeError);
    });

    it('rejects non-string shipping tier with TypeError', () => {
      // @ts-expect-error Testing invalid runtime tier
      expect(() => calculateCartPricing(4500, null)).toThrow(TypeError);
      // @ts-expect-error Testing invalid runtime tier
      expect(() => calculateCartPricing(4500, false)).toThrow(TypeError);
    });

    it('rejects invalid inputs to prevent misleading totals', () => {
      expect(() => calculateCartPricing(-100)).toThrow(RangeError);
      expect(() => calculateCartPricing(NaN)).toThrow(TypeError);
      expect(() => calculateCartPricing(12.34)).toThrow(TypeError);
    });

    it('rejects unsafe integer input and prevents grand total overflow', () => {
      expect(() => calculateCartPricing(Number.MAX_SAFE_INTEGER + 1)).toThrow(RangeError);
      expect(() => calculateCartPricing(Number.MAX_SAFE_INTEGER)).toThrow(RangeError);
    });
  });
});
