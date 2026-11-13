'use client';

import React from 'react';
import Image from 'next/image';
import type { CartItem } from '@/types/cart';
import type { CartPricingSummary } from '@/lib/pricing/cartPricing';
import { formatCurrency } from '@/lib/utils/format';

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  pricing: CartPricingSummary;
}

export function CheckoutOrderSummary({ items, pricing }: CheckoutOrderSummaryProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-900">Order Summary</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      {/* Item List */}
      <ul className="divide-y divide-slate-100 max-h-72 overflow-y-auto" aria-label="Order items">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3 p-4">
            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-50 border border-slate-200/80 shrink-0">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
              {(item.selectedColor || item.selectedCapacity) && (
                <p className="text-xs text-slate-500 mt-0.5">
                  {[item.selectedColor, item.selectedCapacity].filter(Boolean).join(' · ')}
                </p>
              )}
              <p className="text-xs text-slate-500 mt-0.5">Qty: {item.quantity}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-slate-900">
                {formatCurrency(item.priceInCents * item.quantity)}
              </p>
              {item.quantity > 1 && (
                <p className="text-xs text-slate-400">{formatCurrency(item.priceInCents)} each</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Pricing Breakdown */}
      <div className="px-5 py-4 space-y-2 border-t border-slate-100 bg-slate-50/60">
        <div className="flex justify-between text-sm text-slate-600">
          <span>Subtotal</span>
          <span className="font-medium text-slate-900">
            {formatCurrency(pricing.subtotalInCents)}
          </span>
        </div>

        <div className="flex justify-between text-sm text-slate-600">
          <span>
            {pricing.shippingTier === 'express' ? 'Express Shipping' : 'Standard Shipping'}
          </span>
          <span className="font-medium text-slate-900">
            {pricing.shippingInCents === 0 ? (
              <span className="text-emerald-700 font-bold">FREE</span>
            ) : (
              formatCurrency(pricing.shippingInCents)
            )}
          </span>
        </div>

        <div className="flex justify-between text-sm text-slate-600">
          <span>Estimated Tax (8%)</span>
          <span className="font-medium text-slate-900">
            {formatCurrency(pricing.taxInCents)}
          </span>
        </div>

        <div className="flex justify-between pt-2 border-t border-slate-200">
          <span className="text-sm font-bold text-slate-900">Total</span>
          <span className="text-lg font-extrabold text-slate-900 tracking-tight">
            {formatCurrency(pricing.totalInCents)}
          </span>
        </div>

        {/* Free shipping progress (only standard tier, not yet qualified) */}
        {pricing.shippingTier === 'standard' && !pricing.qualifiesForFreeShipping && (
          <p className="text-[11px] text-slate-500 pt-1">
            Add {formatCurrency(pricing.remainingForFreeShippingInCents)} more for free shipping.
          </p>
        )}
      </div>
    </div>
  );
}
