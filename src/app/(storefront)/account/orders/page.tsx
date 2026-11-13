'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { getOrdersByCustomerEmail, cancelOrder } from '@/lib/orders/orderService';
import { formatCurrency } from '@/lib/utils/format';
import { AccountNav } from '@/components/account/AccountNav';
import { AccountAuthGuard } from '@/components/account/AccountAuthGuard';
import { OrderStatusBadge } from '@/components/account/OrderStatusBadge';
import type { Order } from '@/types/order';

type FilterOption = 'ALL' | 'PENDING' | 'DELIVERED' | 'CANCELLED';

function OrderHistoryContent() {
  const { customer } = useCustomerAuth();
  const [filter, setFilter] = useState<FilterOption>('ALL');
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const allOrders: Order[] = useMemo(() => {
    if (!customer?.email) return [];
    return getOrdersByCustomerEmail(customer.email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer?.email, refreshTrigger]);

  const filteredOrders = useMemo(() => {
    if (filter === 'ALL') return allOrders;
    return allOrders.filter((o) => o.status === filter);
  }, [allOrders, filter]);

  const handleConfirmCancel = (orderId: string) => {
    setActionError(null);
    setActionSuccess(null);

    if (!customer?.email) {
      setActionError('Customer session email is unavailable.');
      return;
    }

    try {
      cancelOrder(orderId, customer.email);
      setActionSuccess(`Simulated order cancelled successfully.`);
      setCancelTargetId(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to cancel order.';
      setActionError(message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <AccountNav title="Order History" subtitle="View and manage all orders placed with your account." />

      {/* Action Notification Banners */}
      {actionSuccess && (
        <div
          role="status"
          className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
            <span>{actionSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-xs font-bold text-rose-800 hover:text-rose-950 underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-stone-200 shadow-2xs">
          {(['ALL', 'PENDING', 'DELIVERED', 'CANCELLED'] as const).map((tab) => {
            const count =
              tab === 'ALL'
                ? allOrders.length
                : allOrders.filter((o) => o.status === tab).length;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  filter === tab
                    ? 'bg-orange-600 text-white shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <span>{tab === 'ALL' ? 'All Orders' : tab.charAt(0) + tab.slice(1).toLowerCase()}</span>{' '}
                <span className={filter === tab ? 'text-white/80' : 'text-stone-400'}>({count})</span>
              </button>
            );
          })}
        </div>

        <span className="text-xs text-stone-500">
          Showing {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
        </span>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200/90 p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold text-stone-900 mb-1 font-serif">
            {allOrders.length === 0 ? 'No Orders Recorded' : `No ${filter.toLowerCase()} orders found`}
          </h2>
          <p className="text-sm text-stone-600 max-w-sm mx-auto mb-6 leading-relaxed">
            {allOrders.length === 0
              ? 'You have not placed any simulated orders with this email yet. Items added to cart can be ordered at checkout.'
              : `You do not have any orders matching the "${filter.toLowerCase()}" filter.`}
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold py-3 px-6 rounded-xl transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <ShoppingBag className="w-4 h-4" aria-hidden="true" />
            <span>Explore Backcountry Catalog</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            const isPending = order.status === 'PENDING';
            const isConfirmingCancel = cancelTargetId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 sm:p-6 transition-all"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-bold text-stone-900">
                      {order.orderNumber}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>

                  <div className="flex items-center gap-4 text-xs text-stone-500">
                    <span>Placed {formattedDate}</span>
                    <span className="hidden sm:inline">·</span>
                    <span className="text-base font-black text-stone-900">
                      {formatCurrency(order.pricing.totalInCents)}
                    </span>
                  </div>
                </div>

                {/* Items and Actions Row */}
                <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Item Thumbnails and Names */}
                  <div className="flex items-center gap-3 overflow-x-auto py-1">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 bg-stone-50/80 border border-stone-200/60 rounded-xl p-2 shrink-0 pr-3"
                      >
                        <div className="relative w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0 border border-stone-200/80">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="text-xs">
                          <p className="font-bold text-stone-900 truncate max-w-[140px] sm:max-w-[180px]">
                            {item.name}
                          </p>
                          <p className="text-stone-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions Cluster */}
                  <div className="flex items-center gap-2 shrink-0 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
                    {/* Cancellation Action (strictly PENDING only) */}
                    {isPending && (
                      <>
                        {isConfirmingCancel ? (
                          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-lg p-1.5">
                            <span className="text-xs text-rose-800 font-semibold px-2">Cancel order?</span>
                            <button
                              type="button"
                              onClick={() => handleConfirmCancel(order.id)}
                              className="px-2.5 py-1 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded transition-colors cursor-pointer"
                            >
                              Yes, Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => setCancelTargetId(null)}
                              className="px-2.5 py-1 text-xs font-semibold text-stone-600 hover:bg-stone-200/60 rounded transition-colors cursor-pointer"
                            >
                              Keep
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setCancelTargetId(order.id)}
                            className="text-xs font-semibold text-rose-700 hover:text-rose-900 hover:bg-rose-50 px-3 py-2 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                          >
                            Cancel Order
                          </button>
                        )}
                      </>
                    )}

                    <Link
                      href={`/account/orders/${order.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/80 px-3.5 py-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-400"
                    >
                      <span>Receipt &amp; Details</span>
                      <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AccountOrdersPage() {
  return (
    <AccountAuthGuard>
      <OrderHistoryContent />
    </AccountAuthGuard>
  );
}
