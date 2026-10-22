import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FeaturedProduct } from '@/types/product';
import { formatCurrency } from '@/lib/utils/format';

export interface ProductCardProps {
  product: FeaturedProduct;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const hasValidReviews =
    typeof product.rating === 'number' &&
    product.rating > 0 &&
    typeof product.reviewCount === 'number' &&
    product.reviewCount > 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col bg-white rounded-xl border border-neutral-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E4D36] focus-visible:ring-offset-2"
      aria-label={`View ${product.name}, priced at ${formatCurrency(product.priceInCents)}`}
    >
      {/* Top Image Container */}
      <div className="relative aspect-square w-full bg-[#F4F4F4] flex items-center justify-center p-4 overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.imageAlt ?? product.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          className="object-contain p-3 group-hover:scale-105 transition-transform duration-300 pointer-events-none select-none"
        />
      </div>

      {/* Bottom Content Area */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between bg-white border-t border-neutral-100">
        <div>
          {/* Product Title */}
          <h3 className="text-sm font-semibold text-[#1C3323] truncate group-hover:text-[#FA7109] transition-colors leading-snug">
            {product.name}
          </h3>

          {/* Rating Row with Honest Fallback */}
          <div className="mt-1 h-5 flex items-center">
            {hasValidReviews ? (
              <div className="flex items-center gap-1.5" aria-label={`${product.rating} out of 5 stars based on ${product.reviewCount} reviews`}>
                <div className="flex items-center text-amber-500" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((starIndex) => (
                    <svg
                      key={starIndex}
                      className={`w-3.5 h-3.5 ${
                        (product.rating ?? 0) >= starIndex
                          ? 'fill-current'
                          : (product.rating ?? 0) >= starIndex - 0.5
                          ? 'fill-current opacity-70'
                          : 'fill-neutral-200 text-neutral-200'
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-[#2E4D36]/70">
                  ({product.reviewCount})
                </span>
              </div>
            ) : (
              <span className="text-xs text-[#2E4D36]/60">
                No customer reviews
              </span>
            )}
          </div>
        </div>

        {/* Price */}
        <p className="text-sm sm:text-base font-bold text-[#1C3323] mt-2 tracking-tight">
          {formatCurrency(product.priceInCents)}
        </p>
      </div>
    </Link>
  );
}
