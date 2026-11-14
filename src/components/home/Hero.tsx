import React from 'react';
import { Button } from '@/components/ui/Button';

export interface HeroProps {
  /** Optional custom CTA destination; defaults to in-page '#catalog' */
  ctaHref?: string;
}

export function Hero({ ctaHref = '#catalog' }: HeroProps) {
  return (
    <section
      aria-label="Hero Showcase"
      className="relative w-full min-h-[560px] sm:min-h-[640px] lg:min-h-[720px] h-[80vh] sm:h-[75vh] lg:h-[85vh] max-h-[880px] flex items-start overflow-hidden"
    >
      {/* Responsive Background Images with Native Art Direction */}
      <picture className="absolute inset-0 w-full h-full pointer-events-none select-none">
        {/* Mobile: 320px up to 639px */}
        <source media="(max-width: 639px)" srcSet="/images/hero-bg-480.jpg" />
        {/* Tablet: 640px up to 1023px */}
        <source media="(max-width: 1023px)" srcSet="/images/hero-bg-tablet.jpg" />
        {/* Desktop: 1024px and above (Default Fallback) */}
        <img
          src="/images/hero-bg.jpg"
          alt="Expedition tent and campfire against an alpine sunrise mountain panorama"
          className="w-full h-full object-cover object-center"
          fetchPriority="high"
          decoding="async"
        />
      </picture>

      {/* Directional contrast scrim: vertical on mobile, horizontal on tablet & desktop */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/30 to-black/55 md:bg-gradient-to-r md:from-black/60 md:via-black/25 md:to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Hero Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-32 sm:pt-32 md:pt-42 lg:pt-42 xl:pt-42 pb-12 sm:pb-16">
        <div className="max-w-xl text-left space-y-4 sm:space-y-6">
          {/* Eyebrow kicker */}
          <p className="text-xs sm:text-sm font-bold tracking-widest text-white/95 uppercase drop-shadow-xs">
            GEAR FOR EVERY JOURNEY
          </p>

          {/* Main H1 Headline with Accessible Name */}
          <h1
            aria-label="Explore Beyond the Ordinary"
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-white leading-[1.12] sm:leading-[1.08] drop-shadow-sm font-sans"
          >
            {/* Mobile layout (< 640px) with cyan accent underlines */}
            <span className="block sm:hidden" aria-hidden="true">
              <span className="inline-block">
                EXPLORE BEYOND THE

              </span>
              <br />
              <span className="inline-block mt-2">
                ORDINARY

              </span>
            </span>

            {/* Tablet & Desktop layout (>= 640px) */}
            <span className="hidden sm:inline" aria-hidden="true">
              EXPLORE BEYOND
              <br />
              THE ORDINARY
            </span>
          </h1>

          {/* Primary CTA */}
          <div className="pt-2 sm:pt-4">
            <Button
              href={ctaHref}
              variant="primary"
              size="md"
              className="group min-w-[120px] sm:min-w-[160px] lg:min-w-[180px] h-9 sm:h-12 lg:h-[48px] px-6 sm:px-7 lg:px-8 text-[12px] sm:text-base font-bold uppercase tracking-wider drop-shadow-md gap-2"
            >
              <span>SHOP NOW</span>
              <svg
                className="hidden lg:inline-block w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
