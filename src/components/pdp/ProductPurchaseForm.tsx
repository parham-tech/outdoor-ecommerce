'use client';

import React, { useState } from 'react';
import { ProductColorOption } from '@/types/product';
import { formatCurrency } from '@/lib/utils/format';
import { useCart } from '@/context/CartContext';

export interface ProductPurchaseFormProps {
  productId: string;
  slug: string;
  productName: string;
  category: string;
  priceInCents: number;
  rating?: number | null;
  reviewCount?: number | null;
  shortDescription?: string;
  colors?: ProductColorOption[];
  capacityOptions?: string[];
  sku?: string;
  inStock?: boolean;
}

export function ProductPurchaseForm({
  productId,
  slug,
  productName,
  category,
  priceInCents,
  rating,
  reviewCount,
  shortDescription,
  colors = [],
  capacityOptions = [],
  sku,
  inStock = true,
}: ProductPurchaseFormProps) {
  const { addItem, isHydrated } = useCart();
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedCapacityIndex, setSelectedCapacityIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  const selectedColor = colors[selectedColorIndex];
  const hasReviews = typeof rating === 'number' && rating > 0 && typeof reviewCount === 'number';

  const handleAddToCart = () => {
    if (!inStock || !isHydrated) return;

    const wasAdded = addItem({
      productId,
      slug,
      quantity,
      selectedColor: colors.length > 0 && selectedColor ? selectedColor.name : undefined,
      selectedCapacity:
        capacityOptions.length > 0 ? capacityOptions[selectedCapacityIndex] : undefined,
    });

    if (wasAdded) {
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 2200);
    }
  };

  const handleQuantityDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleQuantityIncrease = () => {
    setQuantity((prev) => Math.min(10, prev + 1));
  };

  return (
    <section aria-label="Product Options and Checkout" className="flex flex-col w-full" data-purpose="product-purchase">
      {/* Category Kicker */}
      <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase mb-1">
        {category}
      </span>

      {/* Main Title */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0b1622] tracking-tight mb-2 leading-tight">
        {productName}
      </h1>

      {/* Star Rating Row */}
      {hasReviews ? (
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center text-amber-500 text-sm tracking-tighter" aria-label={`${rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} aria-hidden="true">
                {(rating ?? 0) >= star ? '★' : (rating ?? 0) >= star - 0.5 ? '★' : '☆'}
              </span>
            ))}
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-900">{rating?.toFixed(1)}</span>
          <a
            href="#reviews"
            className="text-xs text-slate-500 underline hover:text-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 rounded-xs"
          >
            {reviewCount} reviews
          </a>
        </div>
      ) : (
        <div className="text-xs text-slate-400 mb-3">Sample catalog item · No customer reviews</div>
      )}

      {/* Product Price */}
      <div className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
        {formatCurrency(priceInCents)}
      </div>

      {/* Short Summary Description */}
      {shortDescription && (
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 font-normal">
          {shortDescription}
        </p>
      )}

      <hr className="border-slate-200 mb-6" />

      {/* Color Selector Pills */}
      {colors.length > 0 && (
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2.5">
            Color: <span className="font-bold text-slate-700 capitalize">{selectedColor?.name}</span>
          </label>
          <div className="flex items-center gap-3 flex-wrap">
            {colors.map((color, idx) => {
              const isSelected = idx === selectedColorIndex;
              return (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setSelectedColorIndex(idx)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                    isSelected
                      ? 'border-2 border-orange-500 bg-orange-50/30 text-slate-900 shadow-xs'
                      : 'border border-slate-300 bg-white hover:border-slate-400 text-slate-700'
                  }`}
                  aria-pressed={isSelected}
                  aria-label={`Select color ${color.name}`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/15 inline-block shadow-2xs"
                    style={{ backgroundColor: color.hex }}
                    aria-hidden="true"
                  />
                  <span>{color.name}</span>
                  {isSelected && (
                    <svg className="w-3.5 h-3.5 text-orange-600 ml-0.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Capacity / Option Selector */}
      {capacityOptions.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Option
            </span>
            <a
              href="#specifications"
              className="text-xs text-slate-500 hover:text-slate-900 underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 rounded-xs"
            >
              View specifications
            </a>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            {capacityOptions.map((opt, idx) => {
              const isSelected = idx === selectedCapacityIndex;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelectedCapacityIndex(idx)}
                  className={`px-4 sm:px-5 py-2 rounded-lg text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                    isSelected
                      ? 'border-2 border-orange-500 bg-white text-slate-900 shadow-xs'
                      : 'border border-slate-300 bg-white hover:border-slate-400 text-slate-700'
                  }`}
                  aria-pressed={isSelected}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Live Stock Indicator (Truthful demonstration status) */}
      <div className="flex items-center gap-2 text-xs text-slate-600 mb-6">
        <span
          className={`w-2 h-2 rounded-full inline-block ${
            inStock ? 'bg-emerald-500 ring-2 ring-emerald-100' : 'bg-slate-400'
          }`}
          aria-hidden="true"
        />
        <span>
          {inStock
            ? `In stock ${selectedColor ? `in ${selectedColor.name}` : ''} · Sample availability for demonstration`
            : 'Temporarily out of stock'}
        </span>
      </div>

      {/* Quantity Stepper & Add to Cart Primary Button */}
      <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-3">
        {/* Stepper */}
        <div
          className="flex items-center justify-between border border-slate-300 rounded-lg px-3 py-2 bg-white sm:w-32"
          role="group"
          aria-label="Quantity selector"
        >
          <button
            type="button"
            onClick={handleQuantityDecrease}
            disabled={quantity <= 1}
            className="text-slate-500 hover:text-slate-900 disabled:opacity-40 font-bold px-2 py-1 text-base focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 rounded"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="text-sm font-bold text-slate-900 w-8 text-center" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            onClick={handleQuantityIncrease}
            disabled={quantity >= 10}
            className="text-slate-500 hover:text-slate-900 disabled:opacity-40 font-bold px-2 py-1 text-base focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 rounded"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* Primary CTA */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock || !isHydrated}
          aria-disabled={!inStock || !isHydrated}
          className="flex-1 flex items-center justify-center gap-2 bg-[#e86c1e] hover:bg-[#cf5b15] active:bg-[#b54c0e] text-white text-sm font-bold py-3.5 px-6 rounded-lg shadow-sm transition-all duration-150 transform active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
        >
          <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
          <span>
            {!inStock
              ? 'Out of Stock'
              : !isHydrated
              ? 'Loading...'
              : addedToast
              ? 'Added to Cart ✓'
              : 'Add to Cart'}
          </span>
        </button>
      </div>

      {/* Add to Wishlist Button */}
      <button
        type="button"
        onClick={() => setIsWishlisted(!isWishlisted)}
        className={`w-full flex items-center justify-center gap-2 border text-xs font-semibold py-2.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 mb-6 ${
          isWishlisted
            ? 'border-rose-300 bg-rose-50 text-rose-700'
            : 'border-slate-300 hover:bg-slate-50 text-slate-700'
        }`}
        aria-pressed={isWishlisted}
      >
        <svg
          className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'fill-none stroke-current text-slate-500'}`}
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
        <span>{isWishlisted ? 'Saved in wishlist' : 'Add to wishlist'}</span>
      </button>

      {/* Shipping & Return Trust Pills Box */}
      <div className="bg-[#f8f9fa] border border-slate-200/90 rounded-xl p-4 flex flex-col gap-3 mb-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-slate-700 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Free shipping on orders over $150</p>
            <p className="text-[11px] text-slate-500">Dispatches in 1–2 business days.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 pt-2.5 border-t border-slate-200/70">
          <div className="mt-0.5 text-slate-700 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">30-day easy returns</p>
            <p className="text-[11px] text-slate-500">Unused gear in original packaging.</p>
          </div>
        </div>
      </div>

      {/* SKU & Transparency Note */}
      {sku && (
        <p className="text-[10px] text-slate-400">
          SKU: {sku} · Sample product content for demonstration
        </p>
      )}
    </section>
  );
}
