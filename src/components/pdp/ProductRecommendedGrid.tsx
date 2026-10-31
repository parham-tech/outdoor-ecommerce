import React from 'react';
import Link from 'next/link';
import { ShopProduct } from '@/types/product';
import { ProductCard } from '@/components/products/ProductCard';

export interface ProductRecommendedGridProps {
  products: ShopProduct[];
}

export function ProductRecommendedGrid({ products }: ProductRecommendedGridProps) {
  if (products.length === 0) return null;

  return (
    <section
      aria-label="Recommended Related Gear"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full"
      data-purpose="pdp-recommendations"
    >
      {/* Header with Shop All Link */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            You May Also Like
          </h2>
          <p className="text-xs text-slate-500 mt-1">Round out your next adventure.</p>
        </div>
        <Link
          href="/shop"
          className="text-xs sm:text-sm font-bold text-slate-800 hover:text-orange-600 transition-colors flex items-center gap-1 group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 rounded-xs"
        >
          <span>Shop all gear</span>
          <span className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true">
            →
          </span>
        </Link>
      </div>

      {/* 4-Column Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((prod) => (
          <ProductCard
            key={prod.id}
            product={prod}
            variant="catalog"
          />
        ))}
      </div>
    </section>
  );
}
