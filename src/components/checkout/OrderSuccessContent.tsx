'use client';

import React, { useState, useCallback, useMemo, useSyncExternalStore } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2,
  Copy,
  Check,
  Package,
  ShoppingBag,
  ArrowRight,
  AlertCircle,
  Truck,
  CreditCard,
  MapPin,
} from 'lucide-react';
import { getOrderByNumber } from '@/lib/orders/orderService';
import type { Order } from '@/types/order';
import { formatCurrency } from '@/lib/utils/format';

const emptySubscribe = () => () => {};

export function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumberParam = searchParams.get('orderNumber');
  const [copied, setCopied] = useState(false);

  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const order = useMemo<Order | null>(() => {
    if (!isHydrated || !orderNumberParam) return null;
    return getOrderByNumber(orderNumberParam);
  }, [isHydrated, orderNumberParam]);

  const handleCopyOrderNumber = useCallback(() => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [order]);

  // Loading state
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500 text-sm">Loading order details…</div>
      </div>
    );
  }

  // Not found / missing param state
  if (!order) {
    return (
      <div className="min-h-[70vh] bg-slate-50 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Order Not Found</h1>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            {orderNumberParam
              ? `We couldn't locate an order with number "${orderNumberParam}" in your browser session.`
              : 'No order reference was provided in the URL.'}
          </p>
          <div className="space-y-3">
            <Link
              href="/shop"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#A94900] hover:bg-[#8F3E00] text-white text-sm font-bold py-3 px-6 rounded-lg transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A94900] focus-visible:ring-offset-2"
            >
              <ShoppingBag className="w-4 h-4" aria-hidden="true" />
              <span>Explore Shop Catalog</span>
            </Link>
            <Link
              href="/cart"
              className="w-full inline-flex items-center justify-center gap-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold py-2.5 px-6 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <span>View Shopping Cart</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Confirmation Header Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <CheckCircle2 className="w-9 h-9" aria-hidden="true" />
          </div>

          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-3">
            {order.statusLabel || 'Simulated Order Recorded'}
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Simulated Order Confirmed
          </h1>
          <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Thank you, <span className="font-semibold text-slate-900">{order.customer.fullName}</span>!
            Your prototype order has been securely recorded in your browser session.
          </p>

          {/* Order Reference Box */}
          <div className="mt-6 inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-slate-50 border border-slate-200 rounded-xl px-5 py-3">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">
              Order Reference:
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-extrabold text-[#A94900] tracking-wide">
                {order.orderNumber}
              </span>
              <button
                type="button"
                onClick={handleCopyOrderNumber}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A94900]"
                aria-label="Copy order number to clipboard"
                title="Copy order number"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                ) : (
                  <Copy className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
              {copied && (
                <span className="text-xs text-emerald-700 font-medium" role="status">
                  Copied!
                </span>
              )}
            </div>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-xs text-slate-500">{formattedDate}</span>
          </div>

          {/* Prototype Notice Callout */}
          <div className="mt-6 p-4 rounded-xl border border-blue-200 bg-blue-50 text-left flex items-start gap-3">
            <div className="text-blue-600 mt-0.5 shrink-0">
              <CreditCard className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="text-xs text-blue-900 leading-relaxed">
              <p className="font-bold mb-0.5">Prototype Demonstration Environment</p>
              <p>
                This transaction was processed with the simulated checkout gateway ({order.simulatedPayment.provider}).
                No credit card was charged, no financial transaction occurred, and no physical items will be shipped.
              </p>
            </div>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recipient & Contact Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-4 pb-2 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-slate-500" aria-hidden="true" />
              <h2>Shipping Destination</h2>
            </div>
            <div className="space-y-1 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.streetAddress}</p>
              {order.shippingAddress.unit && <p>{order.shippingAddress.unit}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p className="text-xs text-slate-500 uppercase tracking-wider pt-1">
                {order.shippingAddress.country}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
              <p>
                <span className="font-medium text-slate-700">Email:</span> {order.customer.email}
              </p>
              <p>
                <span className="font-medium text-slate-700">Phone:</span> {order.customer.phone}
              </p>
            </div>
          </div>

          {/* Delivery & Payment Method */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-4 pb-2 border-b border-slate-100">
                <Truck className="w-4 h-4 text-slate-500" aria-hidden="true" />
                <h2>Delivery Method</h2>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">
                    {order.shippingTier === 'express' ? 'Express Delivery' : 'Standard Delivery'}
                  </span>
                  <span className="font-bold text-slate-900">
                    {order.pricing.shippingInCents === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE</span>
                    ) : (
                      formatCurrency(order.pricing.shippingInCents)
                    )}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {order.shippingTier === 'express'
                    ? 'Priority simulated handling'
                    : 'Standard ground simulated shipping'}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                <CreditCard className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Simulated Payment</span>
              </div>
              <p className="text-xs text-slate-600">
                Method: <span className="font-semibold text-slate-900">ALTITUDE Simulation Gateway</span>
              </p>
              <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                Status: Recorded Successfully
              </p>
            </div>
          </div>
        </div>

        {/* Purchased Items List */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-500" aria-hidden="true" />
              <h2 className="text-sm font-bold text-slate-900">Purchased Items</h2>
            </div>
            <span className="text-xs text-slate-500">
              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <ul className="divide-y divide-slate-100" aria-label="Purchased items">
            {order.items.map((item) => (
              <li key={item.id} className="p-4 sm:p-6 flex items-center gap-4">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-xl overflow-hidden border border-slate-200/80 shrink-0">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                    {item.name}
                  </h3>
                  {(item.selectedColor || item.selectedCapacity) && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {[item.selectedColor, item.selectedCapacity].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {item.sku && (
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">SKU: {item.sku}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">Quantity: {item.quantity}</p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm sm:text-base font-extrabold text-slate-900">
                    {formatCurrency(item.priceInCents * item.quantity)}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-xs text-slate-400">
                      {formatCurrency(item.priceInCents)} each
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {/* Pricing Breakdown */}
          <div className="bg-slate-50/70 p-6 border-t border-slate-200/80 space-y-2.5">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(order.pricing.subtotalInCents)}
              </span>
            </div>

            <div className="flex justify-between text-sm text-slate-600">
              <span>Shipping ({order.shippingTier === 'express' ? 'Express' : 'Standard'})</span>
              <span className="font-semibold text-slate-900">
                {order.pricing.shippingInCents === 0 ? (
                  <span className="text-emerald-700 font-bold">FREE</span>
                ) : (
                  formatCurrency(order.pricing.shippingInCents)
                )}
              </span>
            </div>

            <div className="flex justify-between text-sm text-slate-600">
              <span>Estimated Sales Tax (8%)</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(order.pricing.taxInCents)}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-base font-bold text-slate-900">Total Recorded</span>
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {formatCurrency(order.pricing.totalInCents)}
              </span>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#A94900] hover:bg-[#8F3E00] active:bg-[#753300] text-white text-sm font-bold py-3.5 px-8 rounded-xl transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A94900] focus-visible:ring-offset-2"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>

          <Link
            href="/cart"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-sm font-semibold py-3.5 px-6 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <span>View Cart</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
