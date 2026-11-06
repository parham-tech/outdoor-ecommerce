import type React from 'react';

/**
 * UI-specific types for the ALTITUDE Admin Dashboard.
 * These types model frontend representation without depending on or altering database schemas.
 */

export interface AdminKPIMetric {
  id: string;
  label: string;
  value: string;
  changePercentage: number;
  trend: 'up' | 'down' | 'neutral';
  timeframe: string;
  description: string;
  isSimulated: boolean;
}

export interface AdminRevenueDataPoint {
  date: string;
  label: string;
  revenueInCents: number;
  orderCount: number;
}

export type AdminOrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface AdminRecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalInCents: number;
  status: AdminOrderStatus;
  itemsCount: number;
  createdAt: string;
}

export type AdminStockStatus = 'LOW_STOCK' | 'OUT_OF_STOCK' | 'IN_STOCK';

export interface AdminInventoryAlert {
  id: string;
  name: string;
  sku: string;
  categoryName: string;
  stock: number;
  stockStatus: AdminStockStatus;
}

export interface AdminBreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface AdminTableColumn<T> {
  header: string;
  accessorKey?: keyof T;
  className?: string;
  headerClassName?: string;
  render?: (row: T) => React.ReactNode;
}
