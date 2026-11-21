import React from 'react';

export function LifestyleBanner() {
  return (
    <section
      aria-labelledby="lifestyle-banner-heading"
      className="relative w-full min-h-[460px] sm:min-h-[380px] md:min-h-[400px] lg:min-h-[460px] flex items-start min-[480px]:items-center overflow-hidden"
    >
      {/* Responsive Background Images with Native Art Direction */}
      <picture className="absolute inset-0 w-full h-full pointer-events-none select-none">
        {/* Mobile: Viewports up to 639px */}
        <source media="(max-width: 480px)" srcSet="/images/lifestyleBanner-480.jpg" />
        {/* Tablet: Viewports 640px up to 1023px */}
        <source media="(max-width: 1023px)" srcSet="/images/lifestyleBanner-tablet.jpg" />
        {/* Desktop: Viewports 1024px and above (Default Fallback) */}
        <img
          src="/images/lifestyleBanner.jpg"
          alt="Alpine lake shoreline with tent and campfire against a mountain sunrise"
          className="w-full h-full object-cover object-center"
          loading="lazy"
          decoding="async"
        />
      </picture>

      {/* Subtle responsive scrim on the right for tablet & desktop to preserve contrast */}
      <div
        className="hidden sm:block absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-amber-50/30 lg:via-transparent lg:to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Content Container: Top-Left on mobile (<640px), Right side on tablet & desktop (>=640px) */}
<div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 flex justify-start min-[480px]:justify-end">        <div className="w-full max-w-[280px]  lg:max-w-xl text-left pt-8 pb-6 sm:py-10 md:py-12 lg:py-16">
          <p className="text-xs sm:text-xs md:text-sm font-bold tracking-widest text-[#1C3323] uppercase mb-1.5 sm:mb-2 md:mb-3 drop-shadow-xs">
            THE OUTDOOR LIFESTYLE
          </p>

          <h2
            id="lifestyle-banner-heading"
            className="text-2xl min-[480px]:text-3xl sm:text-3xl md:text-3xl lg:text-4xl font-extrabold text-[#1C3323] uppercase tracking-tight leading-[1.15] font-sans mb-2 sm:mb-3 md:mb-4 drop-shadow-xs"
          >
            <span className="sm:hidden">GEAR FOR THE JOURNEY</span>
            <span className="hidden sm:inline">
              GEAR FOR THE
              <br />
              JOURNEY
            </span>
          </h2>

          <p className="text-sm min-[480px]:text-sm sm:text-sm md:text-base text-[#1C3323]/90 leading-relaxed font-sans drop-shadow-xs">
            More than just equipment — our gear is designed to help you go
            further, stay longer and experience the wild, your way
          </p>
        </div>
      </div>
    </section>
  );
}
