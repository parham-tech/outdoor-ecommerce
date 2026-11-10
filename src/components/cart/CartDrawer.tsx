'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Info,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils/format';

export function CartDrawer() {
  const {
    items,
    itemCount,
    pricing,
    isDrawerOpen,
    notification,
    closeDrawer,
    updateQuantity,
    removeItem,
    clearCart,
    clearNotification,
  } = useCart();

  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  // Close drawer on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    },
    [isDrawerOpen, closeDrawer]
  );

  // Focus trap inside drawer
  const handleFocusTrap = useCallback(
    (e: KeyboardEvent) => {
      if (!isDrawerOpen || e.key !== 'Tab' || !drawerRef.current) return;

      const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    },
    [isDrawerOpen]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keydown', handleFocusTrap);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keydown', handleFocusTrap);
    };
  }, [handleKeyDown, handleFocusTrap]);

  // Focus management and body scroll locking
  useEffect(() => {
    if (isDrawerOpen) {
      previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Set focus to close button upon opening
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = originalOverflow;
        previouslyFocusedElementRef.current?.focus();
      };
    }
  }, [isDrawerOpen]);

  if (!isDrawerOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-heading"
    >
      {/* Backdrop Scrim */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className="relative z-10 w-full max-w-md sm:max-w-lg h-full bg-white shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200 ease-out"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 bg-[#0b121c] text-white shrink-0">
          <div className="flex items-center gap-3">
            <h2 id="cart-drawer-heading" className="text-lg font-black tracking-wide uppercase font-sans">
              Shopping Cart
            </h2>
            <span className="bg-orange-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeDrawer}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            aria-label="Close shopping cart"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Optional Cart Notification Banner */}
        {notification && (
          <div
            className={`px-4 py-3 flex items-start justify-between gap-3 text-xs shrink-0 border-b ${
              notification.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : notification.type === 'warning'
                ? 'bg-amber-50 text-amber-900 border-amber-200'
                : 'bg-blue-50 text-blue-900 border-blue-200'
            }`}
            role="status"
          >
            <div className="flex items-start gap-2">
              {notification.type === 'error' && (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
              )}
              {notification.type === 'warning' && (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              )}
              {notification.type === 'info' && (
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
              )}
              <span className="leading-snug">{notification.message}</span>
            </div>
            <button
              type="button"
              onClick={clearNotification}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Free Shipping Progress Indicator (only shown when cart has items) */}
        {items.length > 0 && (
          <div className="px-5 sm:px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-700">
                {pricing.qualifiesForFreeShipping ? (
                  <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                    You unlocked Free Standard Shipping!
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
        )}

        {/* Main Body: Item List or Empty State */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                <ShoppingBag className="w-10 h-10 stroke-[1.5]" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Your cart is empty</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xs mb-6 leading-relaxed">
                Explore our expedition-grade gear and apparel built for endurance in the backcountry.
              </p>
              <Link
                href="/shop"
                onClick={closeDrawer}
                className="inline-flex items-center gap-2 bg-[#A94900] hover:bg-[#8F3E00] active:bg-[#753300] text-white text-xs sm:text-sm font-bold py-3 px-6 rounded-lg transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A94900] focus-visible:ring-offset-2"
              >
                <span>Start Shopping</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 -my-3" aria-label="Cart items">
              {items.map((item) => (
                <li key={item.id} className="py-4 flex gap-4 items-start">
                  {/* Item Image */}
                  <div className="relative w-20 h-20 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-200/80">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-contain p-1.5"
                    />
                  </div>

                  {/* Details Column */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        {item.category && (
                          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block truncate">
                            {item.category}
                          </span>
                        )}
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeDrawer}
                          className="text-xs sm:text-sm font-bold text-slate-900 hover:text-orange-600 transition-colors line-clamp-1 block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 rounded-xs"
                        >
                          {item.name}
                        </Link>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 shrink-0"
                        aria-label={`Remove ${item.name} from cart`}
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>

                    {/* Selected Variant Attributes */}
                    {(item.selectedColor || item.selectedCapacity) && (
                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
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

                    {/* Quantity Stepper & Price Row */}
                    <div className="flex items-center justify-between gap-3 mt-3 pt-1">
                      {/* Quantity Stepper */}
                      <div
                        className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden"
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
                          className="text-xs font-bold text-slate-900 w-7 text-center select-none"
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

                      {/* Line Total & Unit Price */}
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-slate-900 tracking-tight">
                          {formatCurrency(item.priceInCents * item.quantity)}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-[10px] text-slate-500">
                            {formatCurrency(item.priceInCents)} each
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Drawer Footer & Order Summary (only when cart has items) */}
        {items.length > 0 && (
          <div className="p-5 sm:p-6 border-t border-slate-200 bg-slate-50/90 shrink-0 space-y-3">
            {/* Complete Order Summary */}
            <div className="space-y-1.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(pricing.subtotalInCents)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>
                  {pricing.shippingTier === 'express' ? 'Express Shipping' : 'Standard Shipping'}
                </span>
                <span className="font-semibold text-slate-900">
                  {pricing.shippingInCents === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    formatCurrency(pricing.shippingInCents)
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Estimated Tax (8%)</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(pricing.taxInCents)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-sm sm:text-base font-bold text-slate-900">Estimated Total</span>
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {formatCurrency(pricing.totalInCents)}
                </span>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="w-full flex items-center justify-center gap-2 bg-[#A94900] hover:bg-[#8F3E00] active:bg-[#753300] text-white text-sm font-bold py-3.5 px-6 rounded-lg transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A94900] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#A94900]"
              aria-label="Proceed to checkout (checkout preview unavailable in current prototype)"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>

            {/* Secondary Actions Row */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                type="button"
                onClick={clearCart}
                className="text-slate-500 hover:text-rose-600 font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 rounded"
              >
                Clear cart
              </button>
              <button
                type="button"
                onClick={closeDrawer}
                className="text-slate-600 hover:text-slate-900 font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 rounded"
              >
                Continue shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
