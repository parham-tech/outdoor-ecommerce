import React from 'react';
import { CustomerReview } from '@/types/review';
import { ReviewCard } from '@/components/reviews/ReviewCard';

export interface CustomerReviewsProps {
  reviews: CustomerReview[];
  eyebrow?: string;
  heading?: string;
}

export function CustomerReviews({
  reviews,
  eyebrow = 'TRUSTED BY EXPLORERS',
  heading = 'What Our Customers Say',
}: CustomerReviewsProps) {
  return (
    <section
      aria-labelledby="customer-reviews-heading"
      className="w-full bg-[#F7F5F0] py-12 sm:py-16 lg:py-20 border-t border-neutral-200/60"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="mb-8 sm:mb-12 text-left">
          <p className="text-xs sm:text-sm font-bold tracking-widest text-[#2E4D36]/80 uppercase mb-2 sm:mb-3 font-sans">
            {eyebrow}
          </p>
          <h2
            id="customer-reviews-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1C3323] tracking-tight font-sans"
          >
            {heading}
          </h2>
        </div>

        {/* 3-Card Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}
