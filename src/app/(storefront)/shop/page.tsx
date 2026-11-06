'use client';

import React, { useState, useMemo } from 'react';
import { ShopNotificationBar } from '@/components/shop/ShopNotificationBar';
import { ShopBreadcrumbs } from '@/components/shop/ShopBreadcrumbs';
import { ShopHeroBanner } from '@/components/shop/ShopHeroBanner';
import { ShopCategoryPills } from '@/components/shop/ShopCategoryPills';
import { ShopFilterSidebar } from '@/components/shop/ShopFilterSidebar';
import { ShopCatalogGrid, SortOption } from '@/components/shop/ShopCatalogGrid';
import { ShopTrustBar } from '@/components/shop/ShopTrustBar';
import { MOCK_SHOP_PRODUCTS } from '@/data/shopCatalog';

export default function ShopPage() {
  // State for filtering and sorting
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 400]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Toggle activity filter
  const handleToggleActivity = (activity: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activity) ? prev.filter((a) => a !== activity) : [...prev, activity]
    );
  };

  // Toggle feature filter
  const handleToggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  };

  // Reset all active filters
  const handleResetFilters = () => {
    setSelectedCategory('');
    setPriceRange([0, 400]);
    setSelectedActivities([]);
    setSelectedFeatures([]);
    setMinRating(null);
  };

  // Calculate active filter count
  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 400 ? 1 : 0) +
    selectedActivities.length +
    selectedFeatures.length +
    (minRating !== null ? 1 : 0);

  // Wishlist toggle handler for future backend sync
  const handleWishlistToggle = () => {
    // Client-side hook ready for future wishlist API persistence
  };



  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = [...MOCK_SHOP_PRODUCTS];

    // Filter by Category
    if (selectedCategory && selectedCategory !== 'All gear') {
      result = result.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by Price Range ($ price)
    const [min, max] = priceRange;
    result = result.filter((p) => {
      const priceInDollars = p.priceInCents / 100;
      return priceInDollars >= min && priceInDollars <= max;
    });

    // Filter by Activity
    if (selectedActivities.length > 0) {
      result = result.filter((p) =>
        p.activity?.some((act) => selectedActivities.includes(act))
      );
    }

    // Filter by Features
    if (selectedFeatures.length > 0) {
      result = result.filter((p) =>
        p.features?.some((feat) => selectedFeatures.includes(feat))
      );
    }

    // Filter by Customer Rating
    if (minRating !== null) {
      result = result.filter((p) => (p.rating ?? 0) >= minRating);
    }

    // Sort products
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.priceInCents - b.priceInCents);
        break;
      case 'price-desc':
        result.sort((a, b) => b.priceInCents - a.priceInCents);
        break;
      case 'rating-desc':
        result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case 'recommended':
      default:
        // Default order
        break;
    }

    return result;
  }, [selectedCategory, priceRange, selectedActivities, selectedFeatures, minRating, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 antialiased selection:bg-orange-500 selection:text-white">
      {/* 1. Notification Bar */}
      <ShopNotificationBar />

      {/* 2. Breadcrumb Navigation */}
      <ShopBreadcrumbs />

      {/* 4. Hero Banner */}
      <ShopHeroBanner />

      {/* 5. Quick Category Pills Rail */}
      <ShopCategoryPills
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 6. Main Catalog Content Area */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 flex-1 w-full">
        {/* Mobile Filter Toggle Bar (< 1024px) */}
        <div className="lg:hidden mb-6 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3">
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-md"
            aria-expanded={isMobileFilterOpen}
            aria-controls="mobile-filter-drawer"
          >
            <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <span>{isMobileFilterOpen ? 'Hide Filters' : 'Show Filters'}</span>
            {activeFilterCount > 0 && (
              <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700"
            >
              Reset
            </button>
          )}
        </div>

        {/* 12-Column Grid: Sidebar (1 Col / ~300px) + Catalog (3 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Sidebar (hidden on mobile, visible on lg) */}
          <div className="hidden lg:block lg:col-span-1 sticky top-24">
            <ShopFilterSidebar
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              selectedActivities={selectedActivities}
              onToggleActivity={handleToggleActivity}
              selectedFeatures={selectedFeatures}
              onToggleFeature={handleToggleFeature}
              minRating={minRating}
              onRatingChange={setMinRating}
              onResetFilters={handleResetFilters}
              activeFilterCount={activeFilterCount}
            />
          </div>

          {/* Mobile Filter Drawer */}
          {isMobileFilterOpen && (
            <div
              id="mobile-filter-drawer"
              className="lg:hidden col-span-1 bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-md"
            >
              <ShopFilterSidebar
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  setIsMobileFilterOpen(false);
                }}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                selectedActivities={selectedActivities}
                onToggleActivity={handleToggleActivity}
                selectedFeatures={selectedFeatures}
                onToggleFeature={handleToggleFeature}
                minRating={minRating}
                onRatingChange={setMinRating}
                onResetFilters={handleResetFilters}
                activeFilterCount={activeFilterCount}
              />
            </div>
          )}

          {/* Catalog Grid Section (Col 2-4 / 3 cols on lg) */}
          <div className="col-span-1 lg:col-span-3">
            <ShopCatalogGrid
              products={filteredProducts}
              totalProductCount={48}
              sortBy={sortBy}
              onSortChange={setSortBy}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onWishlistToggle={handleWishlistToggle}
            />
          </div>
        </div>
      </main>

      {/* 7. Trust Value Props Bar */}
      <ShopTrustBar />
    </div>
  );
}
