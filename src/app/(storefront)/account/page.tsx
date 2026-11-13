'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  Clock,
  ArrowRight,
  ShoppingBag,
  User,
  MapPin,
  Calendar,
} from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { getOrdersByCustomerEmail } from '@/lib/orders/orderService';
import { formatCurrency } from '@/lib/utils/format';
import { AccountNav } from '@/components/account/AccountNav';
import { AccountAuthGuard } from '@/components/account/AccountAuthGuard';
import { OrderStatusBadge } from '@/components/account/OrderStatusBadge';
import type { Order } from '@/types/order';

function AccountDashboardContent() {
  const { customer } = useCustomerAuth();

  const orders: Order[] = customer?.email ? getOrdersByCustomerEmail(customer.email) : [];
  const recentOrders = orders.slice(0, 3);
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'PENDING').length,
    cancelled: orders.filter((o) => o.status === 'CANCELLED').length,
  };

  const memberSince = customer?.createdAt
    ? new Date(customer.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Recent';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <AccountNav />

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <Package className="w-4 h-4 text-orange-600" aria-hidden="true" />
          </div>
          <p className="text-2xl font-black text-stone-900">{stats.total}</p>
          <p className="text-xs text-stone-500 mt-1">Orders associated with {customer?.email}</p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Orders</span>
            <Clock className="w-4 h-4 text-amber-600" aria-hidden="true" />
          </div>
          <p className="text-2xl font-black text-stone-900">{stats.pending}</p>
          <p className="text-xs text-stone-500 mt-1">Awaiting simulated fulfillment</p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Member Since</span>
            <Calendar className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          </div>
          <p className="text-2xl font-black text-stone-900">{memberSince}</p>
          <p className="text-xs text-stone-500 mt-1">Simulated member account active</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Orders */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900 font-serif">Recent Orders</h2>
            {orders.length > 0 && (
              <Link
                href="/account/orders"
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 rounded"
              >
                <span>View All ({orders.length})</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            )}
          </div>

          {recentOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200/90 p-8 text-center shadow-xs">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-1">No Orders Yet</h3>
              <p className="text-xs text-stone-600 max-w-sm mx-auto mb-5 leading-relaxed">
                You haven&apos;t placed any simulated orders with this email yet. Explore our technical camping and backpacking equipment.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-2.5 px-5 rounded-lg transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Explore Shop Catalog</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => {
                const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs hover:border-stone-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-stone-900">
                            {order.orderNumber}
                          </span>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">Placed on {formattedDate}</p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-base font-black text-stone-900">
                          {formatCurrency(order.pricing.totalInCents)}
                        </span>
                        <p className="text-[11px] text-stone-500">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    </div>

                    {/* Line Items Preview */}
                    <div className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-x-auto py-1">
                        {order.items.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className="relative w-12 h-12 rounded-lg bg-stone-50 border border-stone-200/80 overflow-hidden shrink-0"
                            title={`${item.name} (${item.quantity}x)`}
                          >
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <span className="w-12 h-12 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-xs font-bold text-stone-600 shrink-0">
                            +{order.items.length - 3}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/account/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 py-1.5 px-3 rounded-md hover:bg-orange-50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Account & Profile Quick Summary */}
        <div className="space-y-6">
          {/* Customer Profile Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-100">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <User className="w-4 h-4 text-stone-500" aria-hidden="true" />
                <span>Personal Profile</span>
              </h3>
              <Link
                href="/account/profile"
                className="text-xs font-bold text-orange-600 hover:text-orange-700 underline"
              >
                Edit
              </Link>
            </div>
            <div className="space-y-2 text-xs text-stone-600">
              <p>
                <span className="font-semibold text-stone-800">Name:</span> {customer?.fullName}
              </p>
              <p>
                <span className="font-semibold text-stone-800">Email:</span> {customer?.email}
              </p>
              {customer?.phone && (
                <p>
                  <span className="font-semibold text-stone-800">Phone:</span> {customer?.phone}
                </p>
              )}
            </div>
          </div>

          {/* Saved Address Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-100">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-stone-500" aria-hidden="true" />
                <span>Default Address</span>
              </h3>
              <Link
                href="/account/profile"
                className="text-xs font-bold text-orange-600 hover:text-orange-700 underline"
              >
                {customer?.savedAddress ? 'Edit' : 'Add'}
              </Link>
            </div>
            {customer?.savedAddress ? (
              <div className="text-xs text-stone-600 space-y-1">
                <p className="font-semibold text-stone-800">{customer.savedAddress.fullName}</p>
                <p>{customer.savedAddress.streetAddress}</p>
                {customer.savedAddress.unit && <p>{customer.savedAddress.unit}</p>}
                <p>
                  {customer.savedAddress.city}, {customer.savedAddress.state}{' '}
                  {customer.savedAddress.postalCode}
                </p>
                <p className="uppercase text-[10px] text-stone-400">
                  {customer.savedAddress.country}
                </p>
              </div>
            ) : (
              <p className="text-xs text-stone-500">
                No default shipping address saved yet. Save an address to pre-fill future checkouts.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <AccountAuthGuard>
      <AccountDashboardContent />
    </AccountAuthGuard>
  );
}
