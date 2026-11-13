import React from 'react';
import { Clock, XCircle, CheckCircle2, Package } from 'lucide-react';
import type { OrderStatus } from '@/types/order';

export interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export function OrderStatusBadge({
  status,
  size = 'sm',
  className = '',
}: OrderStatusBadgeProps) {
  const isMd = size === 'md';
  const iconClass = isMd ? 'w-3.5 h-3.5' : 'w-3 h-3';
  const containerBase = isMd
    ? 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold'
    : 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold';

  switch (status) {
    case 'PENDING':
      return (
        <span
          className={`${containerBase} bg-amber-50 text-amber-800 border border-amber-200 ${className}`.trim()}
        >
          <Clock className={`${iconClass} text-amber-600`} aria-hidden="true" />
          <span>Pending Mock Fulfillment</span>
        </span>
      );
    case 'CANCELLED':
      return (
        <span
          className={`${containerBase} bg-rose-50 text-rose-800 border border-rose-200 ${className}`.trim()}
        >
          <XCircle className={`${iconClass} text-rose-600`} aria-hidden="true" />
          <span>Cancelled</span>
        </span>
      );
    case 'DELIVERED':
      return (
        <span
          className={`${containerBase} bg-emerald-50 text-emerald-800 border border-emerald-200 ${className}`.trim()}
        >
          <CheckCircle2 className={`${iconClass} text-emerald-600`} aria-hidden="true" />
          <span>Delivered</span>
        </span>
      );
    default:
      return (
        <span
          className={`${containerBase} bg-blue-50 text-blue-800 border border-blue-200 ${className}`.trim()}
        >
          <Package className={`${iconClass} text-blue-600`} aria-hidden="true" />
          <span>{status}</span>
        </span>
      );
  }
}
