import React from 'react';
import Image from 'next/image';

export function LifestyleBanner() {
  return (
    <section
      aria-labelledby="lifestyle-banner-heading"
      className="relative w-full min-h-[360px] sm:min-h-[420px] lg:min-h-[460px] flex items-center overflow-hidden"
    >
      {/* Background Alpine Lake & Mountain Sunrise Image */}
      <Image
        src="/images/lifestyleBanner.png"
        alt="Alpine lake shoreline with tent and campfire against a mountain sunrise"
        fill
        sizes="100vw"
        className="object-cover object-center pointer-events-none select-none"
      />

      {/* Subtle responsive scrim on the right to preserve contrast across narrow viewports */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-amber-50/50 lg:via-transparent lg:to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex justify-end">
        <div className="w-full md:w-3/5 lg:w-1/2 max-w-xl text-left py-12 sm:py-16">
          <p className="text-xs sm:text-sm font-bold tracking-widest text-[#1C3323]/80 uppercase mb-2 sm:mb-3 drop-shadow-xs">
            THE OUTDOOR LIFESTYLE
          </p>

          <h2
            id="lifestyle-banner-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1C3323] uppercase tracking-tight leading-tight font-sans mb-3 sm:mb-4 drop-shadow-xs"
          >
            GEAR FOR THE JOURNEY
          </h2>

          <p className="text-sm sm:text-base text-[#1C3323]/90 leading-relaxed font-sans drop-shadow-xs">
            More than just equipment — our gear is designed to help you go
            further, stay longer and experience the wild, your way
          </p>
        </div>
      </div>
    </section>
  );
}
