'use client';

import React, { useState } from 'react';
import { ShopProduct } from '@/types/product';
import { ProductCard } from '@/components/products/ProductCard';

export type SortOption = 'recommended' | 'price-asc' | 'price-desc' | 'rating-desc';

export interface ShopCatalogGridProps {
  products: ShopProduct[];
  totalProductCount?: number;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onWishlistToggle?: (productId: string, isWishlisted: boolean) => void;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export function ShopCatalogGrid({
  products,
  totalProductCount = 48,
  sortBy,
  onSortChange,
  onWishlistToggle,
  currentPage = 1,
  onPageChange,
}: ShopCatalogGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <section className="space-y-6 w-full" aria-label="Product Catalog">
      {/* Toolbar / Results Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200"
        data-purpose="catalog-toolbar"
      >
        <p className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{products.length > 0 ? `1–${products.length}` : '0'}</span> of{' '}
          <span className="font-bold text-slate-900">{totalProductCount}</span> products
        </p>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <label htmlFor="catalog-sort" className="text-slate-500 whitespace-nowrap">
              Sort by
            </label>
            <div className="relative">
              <select
                id="catalog-sort"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg py-1.5 pl-3 pr-8 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 cursor-pointer"
              >
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Customer Rating</option>
              </select>
            </div>
          </div>

          {/* View Layout Toggles (Grid / List) */}
          <div
            className="flex items-center border border-slate-200 rounded-lg p-0.5 text-slate-500"
            role="group"
            aria-label="View mode toggle"
          >
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 ${
                viewMode === 'grid'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'hover:bg-slate-50 hover:text-slate-700'
              }`}
              title="Grid View"
              aria-label="Grid View"
              aria-pressed={viewMode === 'grid'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 ${
                viewMode === 'list'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'hover:bg-slate-50 hover:text-slate-700'
              }`}
              title="List View"
              aria-label="List View"
              aria-pressed={viewMode === 'list'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Product Cards Container */}
      {products.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8">
          <p className="text-slate-500 text-sm">No products matched your active filters.</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting or loosening your filter criteria.</p>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'grid grid-cols-1 gap-4'
          }
          data-purpose="product-grid"
        >
          {products.map((prod, idx) => (
            <ProductCard
              key={prod.id}
              product={prod}
              variant="catalog"
              priority={idx < 2}
              onWishlistToggle={onWishlistToggle}
            />
          ))}
        </div>
      )}

      {/* Pagination Section matching Stitch design */}
      <div
        className="pt-10 flex flex-col items-center justify-center space-y-3"
        data-purpose="pagination-bar"
      >
        <p className="text-xs text-slate-500 font-normal">
          You&apos;ve explored {products.length} of {totalProductCount} products
        </p>

        <nav aria-label="Catalog Pagination" className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            title="Previous page"
            aria-label="Previous page"
          >
            ‹
          </button>

          {[1, 2, 3].map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange?.(page)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                currentPage === page
                  ? 'bg-[#0b121c] text-white font-bold shadow-xs'
                  : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          ))}

          <span className="px-1 text-slate-400" aria-hidden="true">...</span>

          <button
            type="button"
            onClick={() => onPageChange?.(8)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            8
          </button>

          <button
            type="button"
            onClick={() => onPageChange?.(currentPage + 1)}
            className="px-3 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 gap-1 font-medium transition-colors"
          >
            <span>Next</span>
            <span aria-hidden="true">›</span>
          </button>
        </nav>
      </div>
    </section>
  );
}
