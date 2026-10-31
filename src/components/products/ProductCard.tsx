'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FeaturedProduct, ShopProduct } from '@/types/product';
import { formatCurrency } from '@/lib/utils/format';

export interface ProductCardProps {
  product: FeaturedProduct | ShopProduct;
  priority?: boolean;
  variant?: 'compact' | 'catalog';
  onWishlistToggle?: (productId: string, isWishlisted: boolean) => void;
  isInitiallyWishlisted?: boolean;
}

export function ProductCard({
  product,
  priority = false,
  variant = 'compact',
  onWishlistToggle,
  isInitiallyWishlisted = false,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(isInitiallyWishlisted);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  const shopProduct = product as ShopProduct;
  const isCatalog = variant === 'catalog';

  const hasValidReviews =
    typeof product.rating === 'number' &&
    product.rating > 0 &&
    typeof product.reviewCount === 'number' &&
    product.reviewCount > 0;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isWishlisted;
    setIsWishlisted(nextState);
    onWishlistToggle?.(product.id, nextState);
  };

  if (isCatalog) {
    return (
      <article
        className="group bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all duration-200"
        data-purpose="product-card"
      >
        <div>
          {/* Card Media Slot with Badge & Wishlist Button */}
          <div className="relative bg-[#f4f6f8] aspect-[4/3] flex items-center justify-center p-6 overflow-hidden">
            {shopProduct.badge && (
              <span className="absolute top-3 left-3 z-10 bg-white text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded shadow-xs text-slate-900 select-none">
                {shopProduct.badge}
              </span>
            )}

            <button
              type="button"
              onClick={handleWishlistClick}
              className={`absolute top-3 right-3 z-10 p-1.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                isWishlisted
                  ? 'text-rose-500 bg-white/90 shadow-xs'
                  : 'text-slate-400 hover:text-rose-500 bg-white/60 hover:bg-white'
              }`}
              aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
              title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <svg
                className="w-4 h-4"
                fill={isWishlisted ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
            </button>

            {/* Product Image */}
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={product.imageUrl}
                alt={product.imageAlt ?? product.name}
                fill
                priority={priority}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-contain mix-blend-multiply transition-transform group-hover:scale-105 duration-300 pointer-events-none select-none p-2"
              />
            </div>
          </div>

          {/* Product Body Details */}
          <div className="p-4 space-y-2">
            {shopProduct.category && (
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block">
                {shopProduct.category}
              </span>
            )}

            <Link href={`/products/${product.slug}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-sm">
              <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-orange-600 transition-colors">
                {product.name}
              </h3>
            </Link>

            {shopProduct.specs && (
              <p className="text-xs text-slate-500 font-normal">
                {shopProduct.specs}
              </p>
            )}

            {/* Customer Rating */}
            {hasValidReviews && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-0.5" aria-label={`${product.rating} out of 5 stars`}>
                <div className="flex text-amber-400 text-xs tracking-tighter" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star}>
                      {(product.rating ?? 0) >= star
                        ? '★'
                        : (product.rating ?? 0) >= star - 0.5
                        ? '★'
                        : '☆'}
                    </span>
                  ))}
                </div>
                <span className="text-[11px] text-slate-400">
                  ({product.reviewCount})
                </span>
              </div>
            )}

            {/* Color Swatch Dots */}
            {shopProduct.colorSwatches && shopProduct.colorSwatches.length > 0 && (
              <div className="flex items-center gap-1.5 pt-1">
                {shopProduct.colorSwatches.map((color, idx) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColorIndex(idx)}
                    style={{ backgroundColor: color }}
                    className={`w-2.5 h-2.5 rounded-full transition-all focus-visible:outline-none ${
                      selectedColorIndex === idx
                        ? 'ring-2 ring-slate-800 ring-offset-1 scale-110'
                        : 'ring-1 ring-slate-300 hover:scale-105'
                    }`}
                    aria-label={`Select color option ${idx + 1}`}
                  />
                ))}
                <span className="text-[10px] text-slate-400 ml-1">
                  {shopProduct.colorCount ?? shopProduct.colorSwatches.length} color{(shopProduct.colorCount ?? shopProduct.colorSwatches.length) > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Slot: Price & CTA */}
        <div className="p-4 pt-0 flex items-center justify-between mt-2 border-t border-slate-100 pt-3">
          <span className="text-base font-extrabold text-slate-900">
            {formatCurrency(product.priceInCents)}
          </span>

          <Link
            href={`/products/${product.slug}`}
            className="inline-flex items-center gap-1 bg-[#f97316] hover:bg-orange-600 active:bg-orange-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 group/btn"
          >
            <span>View gear</span>
            <span className="group-hover/btn:translate-x-0.5 transition-transform" aria-hidden="true">→</span>
          </Link>
        </div>
      </article>
    );
  }

  // Default compact layout for homepage FeaturedProducts
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

