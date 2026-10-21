import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';

export interface HeroProps {
  /** Optional custom CTA destination; defaults to in-page '#catalog' */
  ctaHref?: string;
}

export function Hero({ ctaHref = '#catalog' }: HeroProps) {
  return (
    <section
      aria-label="Hero Showcase"
      className="relative w-full min-h-[560px] sm:min-h-[640px] lg:min-h-[720px] h-[85vh] max-h-[880px] flex items-center overflow-hidden"
    >
      {/* Background Mountain Panorama Image */}
      <Image
        src="/images/hero-bg.jpg"
        alt="Expedition tent and campfire against an alpine sunrise mountain panorama"
        fill
        priority
        quality={85}
        sizes="100vw"
        className="object-cover object-center pointer-events-none select-none"
      />

      {/* Subtle linear scrim to guarantee WCAG 2.2 AA text contrast on the left */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Hero Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 sm:pt-20">
        <div className="max-w-xl text-left space-y-4 sm:space-y-6">
          {/* Eyebrow kicker */}
          <p className="text-xs sm:text-sm font-bold tracking-widest text-white/95 uppercase drop-shadow-xs">
            GEAR FOR EVERY JOURNEY
          </p>

          {/* Main H1 Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-tight text-white leading-[1.08] drop-shadow-sm font-sans">
            EXPLORE BEYOND
            <br />
            THE ORDINARY
          </h1>

          {/* Primary CTA */}
          <div className="pt-2 sm:pt-4">
            <Button
              href={ctaHref}
              variant="primary"
              size="md"
              className="drop-shadow-md"
            >
              <span>SHOP NOW</span>
              <svg
                className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1"
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
