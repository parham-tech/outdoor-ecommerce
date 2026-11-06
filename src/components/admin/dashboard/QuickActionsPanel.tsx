import React from 'react';
import Link from 'next/link';
import { PlusCircle, Upload, ShoppingCart, Boxes, Settings, ArrowUpRight } from 'lucide-react';

const ACTIONS = [
  {
    title: 'Add New Product',
    description: 'Create an individual outdoor catalog listing',
    href: '/admin/products?action=create',
    icon: PlusCircle,
    color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  },
  {
    title: 'Bulk CSV / Excel Import',
    description: 'Batch upload product catalog from spreadsheet',
    href: '/admin/products?tab=import',
    icon: Upload,
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  },
  {
    title: 'Review Pending Orders',
    description: 'Inspect orders awaiting dispatch verification',
    href: '/admin/orders?status=PENDING',
    icon: ShoppingCart,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    title: 'Restock Inventory',
    description: 'Adjust low and out-of-stock inventory counts',
    href: '/admin/inventory?filter=low-stock',
    icon: Boxes,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    title: 'Store Settings',
    description: 'Configure demo tax, shipping, and security parameters',
    href: '/admin/settings',
    icon: Settings,
    color: 'text-slate-400 bg-slate-800 border-slate-700',
  },
];

export function QuickActionsPanel() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {ACTIONS.map((action, idx) => {
        const IconComponent = action.icon;
        return (
          <Link
            key={idx}
            href={action.href}
            className="group p-4 bg-slate-900 border border-slate-800/90 rounded-2xl hover:border-slate-700/80 hover:bg-slate-850/80 transition-all duration-150 flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <div>
              <div
                className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 select-none ${action.color}`}
              >
                <IconComponent className="w-4 h-4" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-white text-xs sm:text-sm group-hover:text-orange-400 transition-colors flex items-center justify-between">
                <span>{action.title}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                {action.description}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Quick Action
            </div>
          </Link>
        );
      })}
    </div>
  );
}
