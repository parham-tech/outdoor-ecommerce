import React from 'react';
import Link from 'next/link';
import { FeaturedProduct } from '@/types/product';
import { ProductCard } from '@/components/products/ProductCard';

export interface FeaturedProductsProps {
  products: FeaturedProduct[];
  title?: string;
  viewAllHref?: string;
}

export function FeaturedProducts({
  products,
  title = 'Featured Products',
  viewAllHref = '/products',
}: FeaturedProductsProps) {
  return (
    <section
      aria-labelledby="featured-products-heading"
      className="w-full bg-white py-12 sm:py-16 lg:py-20 border-t border-neutral-100"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header Row: Title & View All Products Navigation Link */}
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <h2
            id="featured-products-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1C3323] tracking-tight font-sans"
          >
            {title}
          </h2>

          <Link
            href={viewAllHref}
            className="group inline-flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base font-bold text-[#1C3323] hover:text-[#FA7109] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E4D36] focus-visible:ring-offset-2 rounded-sm"
            aria-label="View all products"
          >
            <span>View All Products</span>
            <svg
              className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-200 group-hover:translate-x-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {/* 6-Card Responsive Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5 items-stretch">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={index < 2}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
