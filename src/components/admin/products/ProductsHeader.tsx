'use client';

import React from 'react';
import { Plus, FileSpreadsheet, Package, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';

export interface ProductsHeaderProps {
  stats: {
    total: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
  };
  onAddProduct: () => void;
  onImportProducts: () => void;
}

export function ProductsHeader({
  stats,
  onAddProduct,
  onImportProducts,
}: ProductsHeaderProps) {
  return (
    <div className="space-y-4 border-b border-slate-800/80 pb-5">
      {/* Top Row: Title, Subtitle & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2 select-none">
            <Package className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Catalog Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
            Products Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
            Manage product specifications, pricing, live inventory thresholds, and batch import workflows.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={onImportProducts}
            aria-label="Bulk import products from CSV or Excel spreadsheet"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-emerald-500/50 hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-100 hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
            <span>Bulk Import</span>
          </button>

          <button
            type="button"
            onClick={onAddProduct}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-slate-950 font-bold text-xs sm:text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer shadow-md shadow-orange-500/20"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Quick Status Metric Chips */}
      <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap text-xs font-medium">
        {/* Total Products */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
          <Package className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          <span>Total Products:</span>
          <span className="font-bold text-white font-mono">{stats.total}</span>
        </div>

        {/* In Stock */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
          <span>In Stock:</span>
          <span className="font-bold text-emerald-200 font-mono">{stats.inStock}</span>
        </div>

        {/* Low Stock Alerts */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
          <span>Low Stock (≤3):</span>
          <span className="font-bold text-amber-200 font-mono">{stats.lowStock}</span>
        </div>

        {/* Out of Stock Alerts */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300">
          <XCircle className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
          <span>Out of Stock:</span>
          <span className="font-bold text-red-200 font-mono">{stats.outOfStock}</span>
        </div>
      </div>
    </div>
  );
}
