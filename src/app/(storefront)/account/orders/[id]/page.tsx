'use client';

import React, { useMemo, useState, use, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Truck,
  CreditCard,
  MapPin,
  Calendar,
  Ban,
} from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { getOrderById, getOrderByNumber, cancelOrder } from '@/lib/orders/orderService';
import { formatCurrency } from '@/lib/utils/format';
import { AccountNav } from '@/components/account/AccountNav';
import { AccountAuthGuard } from '@/components/account/AccountAuthGuard';
import { OrderStatusBadge } from '@/components/account/OrderStatusBadge';
import type { Order } from '@/types/order';

interface OrderDetailsPageProps {
  params: Promise<{ id: string }>;
}

function OrderDetailsContent({ orderId }: { orderId: string }) {
  const { customer } = useCustomerAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);

  // Retrieve order by ID or orderNumber
  const order: Order | null = useMemo(() => {
    const found = getOrderById(orderId) || getOrderByNumber(orderId);
    return found;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, refreshTrigger]);

  // Ownership verification check
  const isOwner = Boolean(
    order &&
      customer?.email &&
      order.customer?.email?.trim().toLowerCase() ===
        customer.email.trim().toLowerCase()
  );

  const handleCancelOrder = () => {
    if (!order) return;
    setCancelError(null);
    setCancelSuccess(null);

    if (!customer?.email) {
      setCancelError('Customer session email is unavailable.');
      return;
    }

    try {
      cancelOrder(order.id, customer.email);
      setCancelSuccess('Simulated order cancelled successfully.');
      setIsConfirmingCancel(false);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to cancel order.';
      setCancelError(message);
    }
  };

  // Unauthorized or Nonexistent Order View
  if (!order || !isOwner) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <AccountNav />
        <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <AlertCircle className="w-7 h-7" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2 font-serif">Order Not Found</h2>
          <p className="text-sm text-stone-600 max-w-md mx-auto mb-6 leading-relaxed">
            We could not locate this order in your account, or it does not belong to your currently signed-in email ({customer?.email}).
          </p>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold py-3 px-6 rounded-xl transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Order History</span>
          </Link>
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

  const isPending = order.status === 'PENDING';
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <AccountNav />

      {/* Top Breadcrumb & Return Action */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 rounded"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Back to All Orders</span>
        </Link>
        <span className="text-xs text-stone-400">Order ID: {order.id}</span>
      </div>

      {/* Cancellation Alerts */}
      {cancelSuccess && (
        <div
          role="status"
          className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
          <p>{cancelSuccess}</p>
        </div>
      )}

      {cancelError && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" aria-hidden="true" />
          <p>{cancelError}</p>
        </div>
      )}

      {/* Order Header Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-black text-stone-900 font-mono tracking-tight">
                {order.orderNumber}
              </h1>
              <OrderStatusBadge status={order.status} size="md" />
            </div>
            <p className="text-xs text-stone-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Placed on {formattedDate}</span>
            </p>
          </div>

          {/* Cancellation Action if PENDING */}
          {isPending && (
            <div className="shrink-0">
              {isConfirmingCancel ? (
                <div className="flex items-center gap-2 p-2 bg-rose-50 border border-rose-200 rounded-xl">
                  <span className="text-xs font-semibold text-rose-800 px-2">Cancel this order?</span>
                  <button
                    type="button"
                    onClick={handleCancelOrder}
                    className="px-3 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Confirm Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingCancel(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
                  >
                    Keep Order
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingCancel(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                >
                  <Ban className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Cancel Simulated Order</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Order Lifecycle Progress Tracker */}
        <div className="pt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-4">
            Simulated Fulfillment Status
          </h3>

          {isCancelled ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-xs text-rose-900 leading-relaxed">
                <p className="font-bold">Simulated Order Cancelled</p>
                <p>
                  This order was cancelled by the customer. No simulated payment was collected and no items will be dispatched.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 font-semibold text-amber-900">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mx-auto mb-1.5" />
                <span>1. Order Recorded</span>
                <span className="block text-[10px] text-amber-700 font-normal">Pending simulation</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-400">
                <div className="w-2.5 h-2.5 rounded-full bg-stone-300 mx-auto mb-1.5" />
                <span>2. Out for Delivery</span>
                <span className="block text-[10px] text-stone-400 font-normal">Next prototype phase</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-400">
                <div className="w-2.5 h-2.5 rounded-full bg-stone-300 mx-auto mb-1.5" />
                <span>3. Delivered</span>
                <span className="block text-[10px] text-stone-400 font-normal">Pending</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Purchased Line Items Snapshot */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-stone-500" aria-hidden="true" />
            <span>Purchased Items Snapshot</span>
          </h2>
          <span className="text-xs text-stone-500">
            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <ul className="divide-y divide-stone-100" aria-label="Purchased line items">
          {order.items.map((item) => (
            <li key={item.id} className="p-4 sm:p-6 flex items-center gap-4">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-stone-50 rounded-xl overflow-hidden border border-stone-200/80 shrink-0">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-stone-900 truncate">
                  {item.name}
                </h3>
                {(item.selectedColor || item.selectedCapacity) && (
                  <p className="text-xs text-stone-500 mt-0.5">
                    {[item.selectedColor, item.selectedCapacity].filter(Boolean).join(' · ')}
                  </p>
                )}
                {item.sku && (
                  <p className="text-[11px] text-stone-400 font-mono mt-0.5">SKU: {item.sku}</p>
                )}
                <p className="text-xs text-stone-500 mt-1">Quantity: {item.quantity}</p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-sm sm:text-base font-extrabold text-stone-900">
                  {formatCurrency(item.priceInCents * item.quantity)}
                </p>
                {item.quantity > 1 && (
                  <p className="text-xs text-stone-400">
                    {formatCurrency(item.priceInCents)} each
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* Pricing Breakdown */}
        <div className="bg-stone-50/70 p-6 border-t border-stone-200/80 space-y-2.5">
          <div className="flex justify-between text-sm text-stone-600">
            <span>Subtotal</span>
            <span className="font-semibold text-stone-900">
              {formatCurrency(order.pricing.subtotalInCents)}
            </span>
          </div>

          <div className="flex justify-between text-sm text-stone-600">
            <span>Shipping ({order.shippingTier === 'express' ? 'Express' : 'Standard'})</span>
            <span className="font-semibold text-stone-900">
              {order.pricing.shippingInCents === 0 ? (
                <span className="text-emerald-700 font-bold">FREE</span>
              ) : (
                formatCurrency(order.pricing.shippingInCents)
              )}
            </span>
          </div>

          <div className="flex justify-between text-sm text-stone-600">
            <span>Estimated Sales Tax (8%)</span>
            <span className="font-semibold text-stone-900">
              {formatCurrency(order.pricing.taxInCents)}
            </span>
          </div>

          <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
            <span className="text-base font-bold text-stone-900">Grand Total</span>
            <span className="text-2xl font-black text-stone-900 tracking-tight">
              {formatCurrency(order.pricing.totalInCents)}
            </span>
          </div>
        </div>
      </div>

      {/* Shipping & Payment Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Destination Snapshot */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm mb-4 pb-2 border-b border-stone-100">
            <MapPin className="w-4 h-4 text-stone-500" aria-hidden="true" />
            <h2>Shipping Address Snapshot</h2>
          </div>
          <div className="space-y-1 text-sm text-stone-600">
            <p className="font-semibold text-stone-900">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.streetAddress}</p>
            {order.shippingAddress.unit && <p>{order.shippingAddress.unit}</p>}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
              {order.shippingAddress.postalCode}
            </p>
            <p className="text-xs text-stone-500 uppercase tracking-wider pt-1">
              {order.shippingAddress.country}
            </p>
          </div>
        </div>

        {/* Payment & Delivery Method Snapshot */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-stone-900 font-bold text-sm mb-4 pb-2 border-b border-stone-100">
              <Truck className="w-4 h-4 text-stone-500" aria-hidden="true" />
              <h2>Delivery Method</h2>
            </div>
            <div className="text-sm text-stone-600">
              <p className="font-semibold text-stone-900">
                {order.shippingTier === 'express' ? 'Express Delivery' : 'Standard Shipping'}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                {order.shippingTier === 'express' ? 'Priority simulated handling' : 'Standard ground handling'}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
              <CreditCard className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Simulated Payment</span>
            </div>
            <p className="text-xs text-stone-600">
              Method: <span className="font-semibold text-stone-900">{order.simulatedPayment.provider}</span>
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {order.simulatedPayment.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderDetailsView({ params }: OrderDetailsPageProps) {
  const unwrappedParams = use(params);
  return (
    <AccountAuthGuard>
      <OrderDetailsContent orderId={unwrappedParams.id} />
    </AccountAuthGuard>
  );
}

function OrderDetailsFallback() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-pulse">
      <div className="h-6 w-32 bg-stone-200 rounded mb-8" />
      <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-xs mb-6">
        <div className="h-8 bg-stone-200 rounded w-1/3 mb-4" />
        <div className="h-4 bg-stone-100 rounded w-1/4 mb-6" />
        <div className="h-24 bg-stone-50 rounded-xl" />
      </div>
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
        <div className="h-20 bg-stone-100 rounded-xl mb-4" />
        <div className="h-20 bg-stone-100 rounded-xl" />
      </div>
    </div>
  );
}

export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  return (
    <Suspense fallback={<OrderDetailsFallback />}>
      <OrderDetailsView params={params} />
    </Suspense>
  );
}

