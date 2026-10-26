import React from 'react';
import { CustomerReview } from '@/types/review';

export interface ReviewCardProps {
  review: CustomerReview;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <article
      className="bg-white rounded-xl border border-neutral-200/90 p-6 sm:p-7 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow duration-200 h-full"
      aria-label={`Review by ${review.name} from ${review.location}`}
    >
      <div>
        <div className="flex items-start gap-4 mb-4">
          {/* Neutral Circular Avatar Placeholder */}
          <div
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-neutral-200 shrink-0 flex items-center justify-center text-neutral-500 font-bold text-sm sm:text-base select-none"
            aria-hidden="true"
          >
            {review.name.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            {/* Accessible Star Rating Row */}
            <div
              className="flex items-center gap-1 mb-2"
              aria-label={`${review.rating} out of 5 stars`}
            >
              <div className="flex items-center text-amber-500" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((starIndex) => (
                  <svg
                    key={starIndex}
                    className={`w-4 h-4 ${
                      review.rating >= starIndex
                        ? 'fill-current'
                        : review.rating >= starIndex - 0.5
                        ? 'fill-current opacity-70'
                        : 'fill-neutral-200 text-neutral-200'
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Review Comment Quote */}
            <blockquote className="text-sm sm:text-base text-[#1C3323]/90 leading-snug font-sans">
              &ldquo;{review.comment}&rdquo;
            </blockquote>
          </div>
        </div>
      </div>

      {/* Author Name and Location */}
      <div className="mt-4 pt-4 border-t border-neutral-100 pl-16 sm:pl-[4.5rem]">
        <p className="text-sm font-bold text-[#1C3323] leading-tight">
          {review.name}
        </p>
        <p className="text-xs text-[#2E4D36]/70 mt-0.5 leading-tight">
          {review.location}
        </p>
      </div>
    </article>
  );
}
