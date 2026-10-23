import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface GoFurtherBannerProps {
  /** Optional custom CTA destination; defaults to canonical catalog '/products' */
  ctaHref?: string;
}

export function GoFurtherBanner({ ctaHref = '/products' }: GoFurtherBannerProps) {
  return (
    <section
      aria-labelledby="go-further-banner-heading"
      className="relative w-full min-h-[380px] sm:min-h-[440px] lg:min-h-[480px] flex items-center overflow-hidden"
    >
      {/* Background Alpine Panorama with Lake, Campsite Tent, and Golden Sunset */}
      <Image
        src="/images/go-further-banner.png"
        alt="Alpine mountain panorama with lake, campsite tent, and campfire at golden sunset"
        fill
        sizes="100vw"
        quality={90}
        className="object-cover object-center pointer-events-none select-none"
      />

      {/* Base Darkening Scrim for Background Uniformity */}
      <div
        className="absolute inset-0 bg-black/25 pointer-events-none"
        aria-hidden="true"
      />

      {/* Directional Gradient Scrim to Ensure WCAG AA Contrast for Text Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20 sm:via-black/45 sm:to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex justify-start">
        <div className="w-full md:w-3/5 lg:w-1/2 max-w-xl text-left py-12 sm:py-16">
          {/* Eyebrow */}
          <p className="text-xs sm:text-sm font-bold tracking-widest text-white/90 uppercase mb-2 sm:mb-3 drop-shadow-sm font-sans">
            REAL ADVENTURES
          </p>

          {/* Main Heading */}
          <h2
            id="go-further-banner-heading"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white uppercase tracking-tight leading-tight font-sans mb-3 sm:mb-4 drop-shadow-sm"
          >
            GO FURTHER
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg text-white/95 font-medium leading-relaxed font-sans mb-6 sm:mb-8 max-w-md drop-shadow-sm">
            Better gear, wilder places, Unforgettable moments
          </p>

          {/* Call to Action Button */}
          <Link
            href={ctaHref}
            className="group inline-flex items-center gap-2 bg-[#FA7109] text-white hover:bg-[#EA580C] active:bg-[#C2410C] font-bold text-xs sm:text-sm uppercase tracking-wider px-6 sm:px-8 py-3.5 sm:py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black/50"
            aria-label="Shop all gear - View products catalog"
          >
            <span>SHOP ALL GEAR</span>
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
