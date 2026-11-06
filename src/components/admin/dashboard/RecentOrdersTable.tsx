import React from 'react';
import Link from 'next/link';
import { AdminTable } from '@/components/admin/ui/AdminTable';
import { AdminOrderStatusBadge } from '@/components/admin/ui/AdminBadge';
import { formatCurrency } from '@/lib/utils/format';
import type { AdminRecentOrder, AdminTableColumn } from '@/types/admin';

export interface RecentOrdersTableProps {
  orders: AdminRecentOrder[];
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  const columns: AdminTableColumn<AdminRecentOrder>[] = [
    {
      header: 'Order Number',
      render: (order) => (
        <div className="flex flex-col">
          <Link
            href={`/admin/orders?search=${encodeURIComponent(order.orderNumber)}`}
            className="font-mono text-xs font-bold text-orange-400 hover:text-orange-300 underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 rounded"
          >
            {order.orderNumber}
          </Link>
          <span className="text-[11px] text-slate-500">{order.itemsCount} item(s)</span>
        </div>
      ),
    },
    {
      header: 'Customer',
      render: (order) => (
        <div className="flex flex-col">
          <span className="font-medium text-white text-xs sm:text-sm">{order.customerName}</span>
          <span className="text-[11px] text-slate-400 font-mono">{order.customerEmail}</span>
        </div>
      ),
    },
    {
      header: 'Total',
      render: (order) => (
        <span className="font-semibold text-white font-mono text-xs sm:text-sm">
          {formatCurrency(order.totalInCents)}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (order) => <AdminOrderStatusBadge status={order.status} />,
    },
    {
      header: 'Placed',
      render: (order) => (
        <span className="text-xs text-slate-400 whitespace-nowrap">{order.createdAt}</span>
      ),
    },
  ];

  return (
    <div className="w-full">
      <AdminTable
        columns={columns}
        data={orders}
        keyExtractor={(order) => order.id}
        caption="Recent Customer Orders"
        emptyMessage="No recent customer orders found."
      />
    </div>
  );
}
