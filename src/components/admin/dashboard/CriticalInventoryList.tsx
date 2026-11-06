import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { AdminStockStatusBadge } from '@/components/admin/ui/AdminBadge';
import type { AdminInventoryAlert } from '@/types/admin';

export interface CriticalInventoryListProps {
  items: AdminInventoryAlert[];
}

export function CriticalInventoryList({ items }: CriticalInventoryListProps) {
  return (
    <div className="space-y-3">
      <ul className="divide-y divide-slate-800/80">
        {items.map((item) => (
          <li
            key={item.id}
            className="py-3 flex items-center justify-between gap-3 text-xs sm:text-sm first:pt-0 last:pb-0"
          >
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="p-1 rounded bg-amber-500/10 text-amber-400 mt-0.5 shrink-0">
                <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              </div>
              <div className="truncate">
                <p className="font-semibold text-slate-100 truncate">{item.name}</p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                  <span>{item.sku}</span>
                  <span>&bull;</span>
                  <span>{item.categoryName}</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <AdminStockStatusBadge stock={item.stock} status={item.stockStatus} />
              <Link
                href={`/admin/inventory?sku=${encodeURIComponent(item.sku)}`}
                className="hidden sm:inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 font-medium focus-visible:outline-none focus-visible:underline"
                aria-label={`Restock ${item.name}`}
              >
                <span>Restock</span>
                <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <div className="pt-2 text-right">
        <Link
          href="/admin/inventory"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors focus-visible:outline-none focus-visible:underline"
        >
          <span>View all inventory levels</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
