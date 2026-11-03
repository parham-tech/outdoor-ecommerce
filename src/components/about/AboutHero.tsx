import React from 'react';
import Image from 'next/image';

export interface AboutHeroProps {
  kicker?: string;
  title?: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
}

export function AboutHero({
  kicker = 'ABOUT ALTITUDE',
  title = 'BUILT FOR THE WILD. CRAFTED FOR THE JOURNEY.',
  description = 'Thoughtfully designed equipment for quiet mornings, high ridgelines, and every trail in between.',
  imageSrc = '/images/shop/shop-hero-panorama.jpg',
  imageAlt = 'Alpine wilderness mountain panorama at sunset',
}: AboutHeroProps) {
  return (
    <section
      aria-label="About Altitude Hero"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 sm:pb-12 w-full"
      data-purpose="about-hero"
    >
      <div className="relative rounded-2xl overflow-hidden shadow-md min-h-[320px] sm:min-h-[380px] lg:min-h-[420px] flex items-center bg-slate-900">
        {/* Background Mountain Panorama */}
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover object-center pointer-events-none select-none"
        />

        {/* Directional Dark Scrim for Text Readability */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20 sm:to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* Hero Content */}
        <div className="relative z-10 px-6 sm:px-12 py-10 max-w-2xl text-white">
          <span className="inline-block text-xs sm:text-sm font-bold tracking-widest text-[#f97316] uppercase mb-2.5 sm:mb-3 select-none">
            {kicker}
          </span>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold uppercase text-white tracking-tight leading-tight font-sans mb-3 sm:mb-4">
            {title}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed font-normal max-w-xl">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
