'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils/format';
import { PRICING_CONFIG } from '@/config/pricing';

/**
 * Skeleton component rendered while client-side cart hydration is in progress.
 * Prevents SSR markup mismatch and layout shifts.
 */
function CartPageSkeleton() {
  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full animate-pulse"
      aria-busy="true"
      aria-label="Loading shopping cart"
    >
      {/* Breadcrumb skeleton */}
      <div className="h-4 w-32 bg-slate-200 rounded mb-6" />

      {/* Heading skeleton */}
      <div className="h-8 w-48 bg-slate-200 rounded mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Items column skeleton */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4 pb-6 border-b border-slate-100 last:border-b-0 last:pb-0">
              <div className="w-20 h-20 bg-slate-200 rounded-xl shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-1/3 bg-slate-200 rounded" />
                <div className="h-4 w-2/3 bg-slate-200 rounded" />
                <div className="h-8 w-24 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Summary column skeleton */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="h-6 w-32 bg-slate-200 rounded mb-4" />
          <div className="h-4 w-full bg-slate-200 rounded" />
          <div className="h-4 w-full bg-slate-200 rounded" />
          <div className="h-4 w-full bg-slate-200 rounded" />
          <div className="h-12 w-full bg-slate-200 rounded mt-6" />
        </div>
      </div>
    </div>
  );
}

/**
 * Empty cart view displayed when hydration is complete and no items exist.
 */
function EmptyCartView() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 w-full">
      {/* Breadcrumb navigation */}
      <nav aria-label="Breadcrumb" className="text-xs text-slate-500 font-medium mb-8">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/" className="hover:text-slate-800 transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true" className="text-slate-400 select-none">
            ›
          </li>
          <li className="text-slate-800 font-semibold" aria-current="page">
            Cart
          </li>
        </ol>
      </nav>

      <div className="max-w-xl mx-auto text-center bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 shadow-xs">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-5">
          <ShoppingBag className="w-10 h-10 stroke-[1.5]" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Your cart is empty</h1>
        <p className="text-sm text-slate-600 mb-8 leading-relaxed">
          Explore our expedition-grade gear and apparel built for endurance in the backcountry.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-[#A94900] hover:bg-[#8F3E00] active:bg-[#753300] text-white text-sm font-bold py-3.5 px-8 rounded-lg transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A94900] focus-visible:ring-offset-2"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

/**
 * Main dedicated shopping cart page component.
 */
export function CartPageContent() {
  const {
    items,
    itemCount,
    pricing,
    shippingTier,
    isHydrated,
    updateQuantity,
    removeItem,
    clearCart,
    setShippingTier,
  } = useCart();

  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  // 1. Loading/Hydration State
  if (!isHydrated) {
    return <CartPageSkeleton />;
  }

  // 2. Empty Cart State
  if (items.length === 0) {
    return <EmptyCartView />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="text-xs text-slate-500 font-medium mb-6">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/" className="hover:text-slate-800 transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true" className="text-slate-400 select-none">
            ›
          </li>
          <li>
            <Link href="/shop" className="hover:text-slate-800 transition-colors">
              Shop
            </Link>
          </li>
          <li aria-hidden="true" className="text-slate-400 select-none">
            ›
          </li>
          <li className="text-slate-800 font-semibold" aria-current="page">
            Cart
          </li>
        </ol>
      </nav>

      {/* Page Heading & Count Badge */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Shopping Cart
          </h1>
          <span className="bg-[#A94900] text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>
        <Link
          href="/shop"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#A94900] hover:text-[#8F3E00] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {/* Two-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Cart Items (8 cols on lg) */}
        <section aria-label="Cart line items" className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Table Header on Desktop */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {/* Item List */}
            <ul className="divide-y divide-slate-100">
              {items.map((item) => {
                const lineTotalInCents = item.priceInCents * item.quantity;
                return (
                  <li key={item.id} className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                      {/* Product Details & Image (6 cols on desktop) */}
                      <div className="sm:col-span-6 flex gap-4 items-start">
                        {/* Thumbnail */}
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-200/80">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            sizes="(max-width: 640px) 80px, 96px"
                            className="object-contain p-2"
                          />
                        </div>

                        {/* Text Details */}
                        <div className="min-w-0 flex-1">
                          {item.category && (
                            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block truncate">
                              {item.category}
                            </span>
                          )}
                          <Link
                            href={`/products/${item.slug}`}
                            className="text-sm sm:text-base font-bold text-slate-900 hover:text-orange-600 transition-colors line-clamp-2 block leading-snug"
                          >
                            {item.name}
                          </Link>

                          {/* Selected Variant Options */}
                          {(item.selectedColor || item.selectedCapacity) && (
                            <div className="flex items-center gap-1.5 flex-wrap mt-2">
                              {item.selectedColor && (
                                <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                  Color: <strong className="text-slate-800 capitalize">{item.selectedColor}</strong>
                                </span>
                              )}
                              {item.selectedCapacity && (
                                <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                  Option: <strong className="text-slate-800">{item.selectedCapacity}</strong>
                                </span>
                              )}
                            </div>
                          )}

                          {/* Mobile-only unit price */}
                          <div className="sm:hidden text-xs text-slate-500 mt-2">
                            Unit Price: <span className="font-semibold text-slate-800">{formatCurrency(item.priceInCents)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Unit Price (2 cols) */}
                      <div className="hidden sm:block sm:col-span-2 text-right">
                        <span className="text-sm font-semibold text-slate-800">
                          {formatCurrency(item.priceInCents)}
                        </span>
                      </div>

                      {/* Quantity Stepper (2 cols) */}
                      <div className="sm:col-span-2 flex items-center justify-between sm:justify-center">
                        <div
                          className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shadow-2xs"
                          role="group"
                          aria-label={`Quantity selector for ${item.name}`}
                        >
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500"
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>

                          <span
                            className="text-xs font-bold text-slate-900 w-8 text-center select-none"
                            aria-live="polite"
                          >
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.maxSelectableQuantity}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500"
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>

                        {/* Mobile line total & remove button in row */}
                        <div className="sm:hidden flex items-center gap-3">
                          <span className="text-sm font-extrabold text-slate-900">
                            {formatCurrency(lineTotalInCents)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                            aria-label={`Remove ${item.name} from cart`}
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      {/* Desktop Line Total & Remove Button (2 cols) */}
                      <div className="hidden sm:flex sm:col-span-2 items-center justify-end gap-3 text-right">
                        <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                          {formatCurrency(lineTotalInCents)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                          aria-label={`Remove ${item.name} from cart`}
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Cart Actions Bar */}
            <div className="p-4 sm:p-6 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Continue Shopping</span>
              </Link>

              {/* Clear Cart with Confirmation */}
              {!isConfirmingClear ? (
                <button
                  type="button"
                  onClick={() => setIsConfirmingClear(true)}
                  className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 rounded px-2 py-1"
                >
                  Clear Cart
                </button>
              ) : (
                <div
                  role="alert"
                  className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg text-xs"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
                  <span className="text-rose-900 font-medium">Clear all items?</span>
                  <button
                    type="button"
                    onClick={() => {
                      clearCart();
                      setIsConfirmingClear(false);
                    }}
                    className="font-bold text-rose-700 hover:text-rose-900 underline ml-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500 rounded"
                  >
                    Yes, clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingClear(false)}
                    className="font-medium text-slate-600 hover:text-slate-900 ml-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-500 rounded"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Column: Order Summary (4 cols on lg) */}
        <section aria-label="Order summary" className="lg:col-span-4 lg:sticky lg:top-8">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-6">
            <h2 className="text-lg font-black tracking-tight text-slate-900 border-b border-slate-200 pb-3">
              Order Summary
            </h2>

            {/* Standard Free Shipping Progress Bar */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-slate-700">
                  {pricing.qualifiesForFreeShipping ? (
                    <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                      Free Standard Shipping unlocked!
                    </span>
                  ) : (
                    <span>
                      Add <strong className="text-slate-900">{formatCurrency(pricing.remainingForFreeShippingInCents)}</strong> more for Free Shipping
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  ${(pricing.freeShippingThresholdInCents / 100).toFixed(0)} threshold
                </span>
              </div>
              <div
                className="w-full h-2 bg-slate-200 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={pricing.freeShippingProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Free shipping progress"
              >
                <div
                  className={`h-full transition-all duration-300 ${
                    pricing.qualifiesForFreeShipping ? 'bg-emerald-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${pricing.freeShippingProgress}%` }}
                />
              </div>
            </div>

            {/* Line-by-line Cost Breakdown */}
            <div className="space-y-3 text-xs sm:text-sm">
              {/* Subtotal */}
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(pricing.subtotalInCents)}
                </span>
              </div>

              {/* Shipping Tier Selector */}
              <fieldset className="pt-2 border-t border-slate-100">
                <legend className="text-xs font-bold text-slate-800 mb-2">
                  Select Shipping Option
                </legend>
                <div className="space-y-2">
                  {/* Standard Shipping Radio */}
                  <label
                    className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      shippingTier === 'standard'
                        ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="shippingTier"
                        value="standard"
                        checked={shippingTier === 'standard'}
                        onChange={() => setShippingTier('standard')}
                        className="mt-0.5 h-4 w-4 text-[#A94900] border-slate-300 focus:ring-orange-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          Standard Shipping
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {pricing.qualifiesForFreeShipping
                            ? 'Free on orders over $75'
                            : `Add ${formatCurrency(pricing.remainingForFreeShippingInCents)} for free shipping`}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900 shrink-0">
                      {pricing.qualifiesForFreeShipping ? (
                        <span className="text-emerald-700">FREE</span>
                      ) : (
                        formatCurrency(PRICING_CONFIG.STANDARD_SHIPPING_CENTS)
                      )}
                    </span>
                  </label>

                  {/* Express Shipping Radio */}
                  <label
                    className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      shippingTier === 'express'
                        ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="shippingTier"
                        value="express"
                        checked={shippingTier === 'express'}
                        onChange={() => setShippingTier('express')}
                        className="mt-0.5 h-4 w-4 text-[#A94900] border-slate-300 focus:ring-orange-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          Express Shipping
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Expedited transit
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900 shrink-0">
                      {formatCurrency(PRICING_CONFIG.EXPRESS_SHIPPING_CENTS)}
                    </span>
                  </label>
                </div>
              </fieldset>

              {/* Tax */}
              <div className="flex items-center justify-between text-slate-600 pt-2 border-t border-slate-100">
                <span>Estimated Tax (8%)</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(pricing.taxInCents)}
                </span>
              </div>

              {/* Grand Total */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-base font-bold text-slate-900">Estimated Total</span>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {formatCurrency(pricing.totalInCents)}
                </span>
              </div>
            </div>

            {/* Prototype Checkout Action */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="w-full flex items-center justify-center gap-2 bg-[#A94900] text-white text-sm font-bold py-3.5 px-6 rounded-lg shadow-xs opacity-50 cursor-not-allowed focus-visible:outline-none"
                aria-label="Proceed to checkout (checkout preview unavailable in current prototype)"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <p className="text-[11px] text-slate-500 text-center">
                Checkout preview unavailable in current prototype.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
