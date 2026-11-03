import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';

export interface AboutCtaBannerProps {
  ctaHref?: string;
}

export function AboutCtaBanner({ ctaHref = '/shop' }: AboutCtaBannerProps) {
  return (
    <section
      aria-labelledby="about-cta-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 w-full"
      data-purpose="about-cta-banner"
    >
      <div className="relative rounded-2xl overflow-hidden shadow-md min-h-[260px] sm:min-h-[320px] flex items-center justify-center text-center p-6 sm:p-12 bg-slate-900">
        {/* Background Twilight Mountain Ridges Image */}
        <Image
          src="/images/newsletter-banner.png"
          alt="Panoramic twilight mountain ridges with sunset glow"
          fill
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover object-center pointer-events-none select-none"
        />

        {/* Darkening Scrim for Contrast */}
        <div
          className="absolute inset-0 bg-black/45 pointer-events-none"
          aria-hidden="true"
        />

        {/* Content Box */}
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#f97316] mb-2 sm:mb-3">
            START YOUR JOURNEY
          </p>

          <h2
            id="about-cta-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase text-white tracking-tight leading-tight font-sans mb-3 sm:mb-4"
          >
            READY FOR YOUR NEXT ADVENTURE?
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed font-normal max-w-xl mb-6 sm:mb-8">
            Explore our complete collection of tents, packs, sleeping gear, and backcountry essentials.
          </p>

          <Button href={ctaHref} variant="primary" size="lg" className="rounded-xl shadow-md">
            <span>SHOP ALL GEAR</span>
            <span aria-hidden="true" className="ml-1.5">
              →
            </span>
          </Button>
        </div>
      </div>
    </section>
  );
}
