'use client';

import React, { useState } from 'react';
import { ProductReviewsSummary, ProductSampleReview } from '@/types/product';

export interface ProductReviewsSectionProps {
  productName: string;
  reviewsSummary?: ProductReviewsSummary;
  sampleReviews?: ProductSampleReview[];
}

export function ProductReviewsSection({
  productName,
  reviewsSummary,
  sampleReviews = [],
}: ProductReviewsSectionProps) {
  const [reviews, setReviews] = useState<ProductSampleReview[]>(sampleReviews);
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent');
  const [helpfulVoted, setHelpfulVoted] = useState<Record<string, boolean>>({});
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [hasWrittenReview, setHasWrittenReview] = useState(false);

  const averageRating = reviewsSummary?.averageRating ?? 4.0;
  const totalReviews = reviewsSummary?.totalReviews ?? reviews.length;
  const distribution = reviewsSummary?.ratingDistribution ?? [
    { stars: 5, count: 40, percentage: 45 },
    { stars: 4, count: 55, percentage: 60 },
    { stars: 3, count: 20, percentage: 25 },
    { stars: 2, count: 4, percentage: 5 },
    { stars: 1, count: 4, percentage: 5 },
  ];

  const handleHelpfulClick = (reviewId: string) => {
    if (helpfulVoted[reviewId]) return;
    setHelpfulVoted((prev) => ({ ...prev, [reviewId]: true }));
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r))
    );
  };

  const handleSortChange = (newSort: 'recent' | 'highest' | 'lowest') => {
    setSortBy(newSort);
    const sorted = [...reviews];
    if (newSort === 'highest') {
      sorted.sort((a, b) => b.rating - a.rating);
    } else if (newSort === 'lowest') {
      sorted.sort((a, b) => a.rating - b.rating);
    }
    setReviews(sorted);
  };

  return (
    <section
      id="reviews"
      aria-label="Customer Reviews"
      className="bg-[#fcfdfe] border-t border-slate-200 py-12 sm:py-16 scroll-mt-28"
      data-purpose="product-reviews"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Customer reviews
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Sample ratings and reviews for demonstration; not verified customer testimonials.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Summary Breakdown Card */}
          <div className="lg:col-span-4 border border-slate-200 rounded-2xl p-6 bg-white shadow-xs">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500 font-semibold">out of 5</span>
            </div>

            <div className="flex items-center text-amber-500 text-base mb-1 tracking-tight" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star}>
                  {averageRating >= star ? '★' : averageRating >= star - 0.5 ? '★' : '☆'}
                </span>
              ))}
            </div>

            <p className="text-xs text-slate-500 mb-6 font-medium">Based on {totalReviews} reviews</p>

            {/* Star Distribution Histogram */}
            <div className="space-y-2.5 text-xs">
              {distribution.map((dist) => (
                <div key={dist.stars} className="flex items-center gap-3">
                  <span className="w-7 text-slate-600 font-medium whitespace-nowrap">{dist.stars} ★</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#e86c1e] h-full rounded-full transition-all duration-500"
                      style={{ width: `${dist.percentage}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-slate-400 font-mono text-[11px]">{dist.count}</span>
                </div>
              ))}
            </div>

            {/* Write a Review Subbox */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 mb-1">
                Been out there with the {productName}?
              </h4>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Share what worked for your adventure.
              </p>

              {hasWrittenReview ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium text-center">
                  Review submitted in demonstration mode!
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(true)}
                  className="w-full py-2.5 px-4 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                >
                  Write a Review
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Reviews Feed */}
          <div className="lg:col-span-8 flex flex-col">
            {/* Feed Toolbar & Sorter */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
              <span className="text-xs text-slate-600 font-medium">
                Showing {reviews.length} of {totalReviews} reviews
              </span>
              <div className="flex items-center gap-2 text-xs">
                <label htmlFor="review-sort" className="text-slate-500 whitespace-nowrap">
                  Sort
                </label>
                <select
                  id="review-sort"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as typeof sortBy)}
                  className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value="recent">Most recent</option>
                  <option value="highest">Highest rating</option>
                  <option value="lowest">Lowest rating</option>
                </select>
              </div>
            </div>

            {/* Review Cards List */}
            {reviews.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
                No sample reviews registered for this catalog item.
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((rev) => (
                  <article key={rev.id} className="border-b border-slate-100 pb-6 last:border-none">
                    <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{rev.author}</span>
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium select-none">
                          Sample review
                        </span>
                      </div>
                      <time className="text-xs text-slate-400 font-normal">{rev.date}</time>
                    </div>

                    <div className="flex text-amber-500 text-xs mb-2 tracking-tight" aria-label={`${rev.rating} out of 5 stars`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} aria-hidden="true">
                          {rev.rating >= star ? '★' : '☆'}
                        </span>
                      ))}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mb-1.5">{rev.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">{rev.content}</p>

                    <button
                      type="button"
                      onClick={() => handleHelpfulClick(rev.id)}
                      disabled={helpfulVoted[rev.id]}
                      className={`inline-flex items-center gap-1.5 text-xs transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 ${
                        helpfulVoted[rev.id]
                          ? 'text-emerald-600 font-bold'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <svg className="w-3.5 h-3.5 stroke-current fill-none" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                      <span>
                        {helpfulVoted[rev.id] ? `Helpful (${rev.helpfulCount}) ✓` : `Helpful (${rev.helpfulCount})`}
                      </span>
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal Dialog (Demonstration Mode) */}
      {isWriteModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="write-review-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 id="write-review-title" className="text-base font-bold text-slate-900">
              Write a Review (Demonstration)
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              This storefront currently operates in frontend prototype mode. Live review submission and moderation will be enabled with backend integration.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsWriteModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setHasWrittenReview(true);
                  setIsWriteModalOpen(false);
                }}
                className="px-4 py-2 bg-[#e86c1e] hover:bg-[#cf5b15] text-white rounded-lg text-xs font-bold"
              >
                Submit Demo Review
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
