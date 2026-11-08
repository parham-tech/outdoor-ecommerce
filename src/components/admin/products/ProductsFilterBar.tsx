'use client';

import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { ADMIN_PRODUCT_CATEGORIES } from '@/lib/mock/admin-products-data';
import type { AdminProductSortOption, AdminStockFilterOption } from '@/types/admin-product';

export interface ProductsFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  selectedStockFilter: AdminStockFilterOption;
  onStockFilterChange: (stockFilter: AdminStockFilterOption) => void;
  sortBy: AdminProductSortOption;
  onSortChange: (sort: AdminProductSortOption) => void;
  isFiltered: boolean;
  onResetFilters: () => void;
  totalFilteredCount: number;
}

export function ProductsFilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStockFilter,
  onStockFilterChange,
  sortBy,
  onSortChange,
  isFiltered,
  onResetFilters,
  totalFilteredCount,
}: ProductsFilterBarProps) {
  return (
    <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        {/* Search Input (Takes 5 cols on md) */}
        <div className="md:col-span-5 relative">
          <label htmlFor="product-search-input" className="sr-only">
            Search products
          </label>
          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="product-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by title, SKU, category..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search query"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Select (Takes 3 cols on md) */}
        <div className="md:col-span-3">
          <label htmlFor="product-category-select" className="sr-only">
            Filter by Category
          </label>
          <div className="relative">
            <select
              id="product-category-select"
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer appearance-none transition-all"
            >
              <option value="all">All Categories</option>
              {ADMIN_PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Stock Filter Select (Takes 2 cols on md) */}
        <div className="md:col-span-2">
          <label htmlFor="product-stock-select" className="sr-only">
            Filter by Stock Level
          </label>
          <div className="relative">
            <select
              id="product-stock-select"
              value={selectedStockFilter}
              onChange={(e) => onStockFilterChange(e.target.value as AdminStockFilterOption)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer appearance-none transition-all"
            >
              <option value="all">All Stock</option>
              <option value="in_stock">In Stock (&gt;3)</option>
              <option value="low_stock">Low Stock (1–3)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Sort Select (Takes 2 cols on md) */}
        <div className="md:col-span-2">
          <label htmlFor="product-sort-select" className="sr-only">
            Sort Products
          </label>
          <div className="relative">
            <select
              id="product-sort-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as AdminProductSortOption)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer appearance-none transition-all"
            >
              <option value="newest">Newest First</option>
              <option value="name-asc">Name (A → Z)</option>
              <option value="name-desc">Name (Z → A)</option>
              <option value="price-asc">Price (Low → High)</option>
              <option value="price-desc">Price (High → Low)</option>
              <option value="stock-asc">Stock (Low → High)</option>
              <option value="stock-desc">Stock (High → Low)</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* Filter Status Strip & Reset Button */}
      {isFiltered && (
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Filter className="w-3.5 h-3.5 text-orange-400" aria-hidden="true" />
            <span>
              Found <strong className="text-white font-mono">{totalFilteredCount}</strong> matching products
            </span>
          </div>

          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset Filters</span>
          </button>
        </div>
      )}
    </div>
  );
}
