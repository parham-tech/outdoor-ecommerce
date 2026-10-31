'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SHOP_CATEGORIES, ACTIVITY_FACETS, FEATURE_FACETS } from '@/data/shopCatalog';


export interface ShopFilterSidebarProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  selectedActivities: string[];
  onToggleActivity: (activity: string) => void;
  selectedFeatures: string[];
  onToggleFeature: (feature: string) => void;
  minRating: number | null;
  onRatingChange: (rating: number | null) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
}

export function ShopFilterSidebar({
  selectedCategory,
  onSelectCategory,
  priceRange,
  onPriceRangeChange,
  selectedActivities,
  onToggleActivity,
  selectedFeatures,
  onToggleFeature,
  minRating,
  onRatingChange,
  onResetFilters,
  activeFilterCount,
}: ShopFilterSidebarProps) {
  // Collapsible section state
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    category: false,
    price: false,
    activity: false,
    features: false,
    rating: false,
  });

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const [minPrice, maxPrice] = priceRange;

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value.replace(/[^0-9]/g, ''));
    if (!isNaN(val)) {
      onPriceRangeChange([val, Math.max(val, maxPrice)]);
    }
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value.replace(/[^0-9]/g, ''));
    if (!isNaN(val)) {
      onPriceRangeChange([Math.min(minPrice, val), val]);
    }
  };

  return (
    <aside className="space-y-6 w-full" data-purpose="catalog-filters">
      {/* Filters Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-bold">
              {activeFilterCount}
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors focus-visible:outline-none focus-visible:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter Section: Category */}
      <div className="space-y-3 pb-5 border-b border-slate-200">
        <button
          type="button"
          onClick={() => toggleSection('category')}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-900 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 rounded-xs"
          aria-expanded={!collapsedSections.category}
        >
          <span>Category</span>
          <span className="text-slate-400 text-base font-light select-none">
            {collapsedSections.category ? '+' : '−'}
          </span>
        </button>

        {!collapsedSections.category && (
          <div className="space-y-1.5 text-xs text-slate-600 font-medium pt-1">
            {/* All Gear Item */}
            <button
              type="button"
              onClick={() => onSelectCategory('')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors text-left ${
                selectedCategory === '' || selectedCategory === 'All gear'
                  ? 'bg-orange-50/70 text-orange-950 font-bold'
                  : 'hover:bg-slate-50 text-slate-700 font-medium'
              }`}
            >
              <span>All gear</span>
              <span className={selectedCategory === '' || selectedCategory === 'All gear' ? 'text-orange-900 font-bold' : 'text-slate-400 text-[11px]'}>
                48
              </span>
            </button>

            {/* Sub-categories */}
            {SHOP_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <label
                  key={cat.id}
                  className="flex items-center justify-between px-2.5 py-1 rounded hover:bg-slate-50 cursor-pointer select-none transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectCategory(isSelected ? '' : cat.name)}
                      className="rounded border-slate-300 text-orange-500 focus:ring-orange-400 w-3.5 h-3.5"
                    />
                    <span className={isSelected ? 'text-slate-900 font-semibold' : 'text-slate-700'}>
                      {cat.name}
                    </span>
                  </span>
                  <span className="text-slate-400 text-[11px] font-normal">
                    {cat.count}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter Section: Price Range */}
      <div className="space-y-3 pb-5 border-b border-slate-200">
        <button
          type="button"
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-900 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 rounded-xs"
          aria-expanded={!collapsedSections.price}
        >
          <span>Price</span>
          <span className="text-slate-400 text-base font-light select-none">
            {collapsedSections.price ? '+' : '−'}
          </span>
        </button>

        {!collapsedSections.price && (
          <div className="pt-2 px-1">
            {/* Dual Range Bar Illustration matching Stitch design */}
            <div className="relative flex items-center py-2">
              <div className="w-full h-1.5 bg-slate-200 rounded-full relative overflow-hidden">
                <div
                  className="absolute h-full bg-orange-500 rounded-full"
                  style={{
                    left: `${Math.min(100, Math.max(0, (minPrice / 400) * 100))}%`,
                    right: `${Math.min(100, Math.max(0, 100 - (maxPrice / 400) * 100))}%`,
                  }}
                />
              </div>
              <div
                className="absolute w-3.5 h-3.5 bg-white border-2 border-orange-500 rounded-full shadow-xs cursor-pointer -translate-x-1/2"
                style={{ left: `${Math.min(100, Math.max(0, (minPrice / 400) * 100))}%` }}
                aria-hidden="true"
              />
              <div
                className="absolute w-3.5 h-3.5 bg-white border-2 border-orange-500 rounded-full shadow-xs cursor-pointer -translate-x-1/2"
                style={{ left: `${Math.min(100, Math.max(0, (maxPrice / 400) * 100))}%` }}
                aria-hidden="true"
              />
            </div>

            {/* Currency Input Boxes */}
            <div className="flex items-center justify-between gap-3 mt-3">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-2.5 flex items-center text-xs text-slate-400 font-medium" aria-hidden="true">
                  $
                </span>
                <input
                  type="text"
                  value={minPrice}
                  onChange={handleMinPriceChange}
                  aria-label="Minimum price in dollars"
                  className="w-full pl-6 pr-2 py-1.5 text-xs text-slate-800 border border-slate-200 rounded-md focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <span className="text-slate-400 text-xs" aria-hidden="true">–</span>

              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-2.5 flex items-center text-xs text-slate-400 font-medium" aria-hidden="true">
                  $
                </span>
                <input
                  type="text"
                  value={maxPrice}
                  onChange={handleMaxPriceChange}
                  aria-label="Maximum price in dollars"
                  className="w-full pl-6 pr-2 py-1.5 text-xs text-slate-800 border border-slate-200 rounded-md focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Section: Activity */}
      <div className="space-y-3 pb-5 border-b border-slate-200">
        <button
          type="button"
          onClick={() => toggleSection('activity')}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-900 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 rounded-xs"
          aria-expanded={!collapsedSections.activity}
        >
          <span>Activity</span>
          <span className="text-slate-400 text-base font-light select-none">
            {collapsedSections.activity ? '+' : '−'}
          </span>
        </button>

        {!collapsedSections.activity && (
          <div className="space-y-2 text-xs text-slate-600 font-medium pt-1">
            {ACTIVITY_FACETS.map((act) => {
              const isChecked = selectedActivities.includes(act);
              return (
                <label key={act} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleActivity(act)}
                    className="rounded border-slate-300 text-orange-500 focus:ring-orange-400 w-3.5 h-3.5"
                  />
                  <span className={isChecked ? 'text-slate-900 font-semibold' : 'text-slate-700'}>
                    {act}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter Section: Features */}
      <div className="space-y-3 pb-5 border-b border-slate-200">
        <button
          type="button"
          onClick={() => toggleSection('features')}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-900 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 rounded-xs"
          aria-expanded={!collapsedSections.features}
        >
          <span>Features</span>
          <span className="text-slate-400 text-base font-light select-none">
            {collapsedSections.features ? '+' : '−'}
          </span>
        </button>

        {!collapsedSections.features && (
          <div className="space-y-2 text-xs text-slate-600 font-medium pt-1">
            {FEATURE_FACETS.map((feat) => {
              const isChecked = selectedFeatures.includes(feat);
              return (
                <label key={feat} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleFeature(feat)}
                    className="rounded border-slate-300 text-orange-500 focus:ring-orange-400 w-3.5 h-3.5"
                  />
                  <span className={isChecked ? 'text-slate-900 font-semibold' : 'text-slate-700'}>
                    {feat}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter Section: Customer Rating */}
      <div className="space-y-3 pb-5 border-b border-slate-200">
        <button
          type="button"
          onClick={() => toggleSection('rating')}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-900 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 rounded-xs"
          aria-expanded={!collapsedSections.rating}
        >
          <span>Customer rating</span>
          <span className="text-slate-400 text-base font-light select-none">
            {collapsedSections.rating ? '+' : '−'}
          </span>
        </button>

        {!collapsedSections.rating && (
          <div className="pt-1">
            <label className="flex items-center justify-between text-xs text-slate-600 font-medium cursor-pointer select-none">
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={minRating === 4}
                  onChange={() => onRatingChange(minRating === 4 ? null : 4)}
                  className="rounded border-slate-300 text-orange-500 focus:ring-orange-400 w-3.5 h-3.5"
                />
                <span className={minRating === 4 ? 'text-slate-900 font-semibold' : 'text-slate-700'}>
                  4 stars &amp; up
                </span>
              </span>
              <span className="text-slate-400 text-[11px]">35</span>
            </label>
          </div>
        )}
      </div>

      {/* Sidebar Contact / Help Card matching Stitch design */}
      <div
        className="bg-[#f8fafc] rounded-xl p-4 border border-slate-200/80 space-y-2.5"
        data-purpose="help-card"
      >
        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </div>
        <h4 className="text-xs font-bold text-slate-900">
          Need a little direction?
        </h4>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Our outdoor team can help you find the right gear.
        </p>
        <Link
          href="/#contact"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-orange-600 pt-1 group focus-visible:outline-none focus-visible:underline"
        >
          <span>Talk to a gear expert</span>
          <span className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true">
            →
          </span>
        </Link>
      </div>
    </aside>
  );
}

