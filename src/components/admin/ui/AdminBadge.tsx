import React from 'react';
import { cn } from '@/lib/utils/cn';
import type { AdminOrderStatus, AdminStockStatus } from '@/types/admin';

export type AdminBadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export interface AdminBadgeProps {
  children: React.ReactNode;
  variant?: AdminBadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

const VARIANT_STYLES: Record<AdminBadgeVariant, string> = {
  default: 'bg-slate-800 text-slate-300 border-slate-700/80',
  primary: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  success: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40',
  warning: 'bg-amber-950/70 text-amber-300 border-amber-500/40',
  error: 'bg-red-950/70 text-red-300 border-red-500/40',
  info: 'bg-sky-950/70 text-sky-300 border-sky-500/40',
};

const SIZE_STYLES = {
  sm: 'px-2 py-0.5 text-[11px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
};

export function AdminBadge({
  children,
  variant = 'default',
  size = 'sm',
  className,
  icon,
}: AdminBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full border tracking-wide uppercase font-sans select-none',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

/**
 * Convenience helper to render semantic order status badges
 */
export function AdminOrderStatusBadge({ status }: { status: AdminOrderStatus }) {
  switch (status) {
    case 'PENDING':
      return <AdminBadge variant="warning">Pending</AdminBadge>;
    case 'CONFIRMED':
      return <AdminBadge variant="info">Confirmed</AdminBadge>;
    case 'SHIPPED':
      return <AdminBadge variant="info">Shipped</AdminBadge>;
    case 'DELIVERED':
      return <AdminBadge variant="success">Delivered</AdminBadge>;
    case 'CANCELLED':
      return <AdminBadge variant="error">Cancelled</AdminBadge>;
    default:
      return <AdminBadge variant="default">{status}</AdminBadge>;
  }
}

/**
 * Convenience helper to render stock status badges
 */
export function AdminStockStatusBadge({
  stock,
  status,
}: {
  stock: number;
  status: AdminStockStatus;
}) {
  if (status === 'OUT_OF_STOCK' || stock === 0) {
    return <AdminBadge variant="error">Out of Stock (0)</AdminBadge>;
  }
  if (status === 'LOW_STOCK' || stock <= 3) {
    return <AdminBadge variant="warning">Low Stock ({stock})</AdminBadge>;
  }
  return <AdminBadge variant="success">In Stock ({stock})</AdminBadge>;
}
