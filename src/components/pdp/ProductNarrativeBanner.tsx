import React from 'react';
import Image from 'next/image';

export interface ProductNarrativeBannerProps {
  kicker?: string;
  title?: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
}

export function ProductNarrativeBanner({
  kicker = 'MAKE ROOM FOR ADVENTURE',
  title = 'A home wherever the trail ends.',
  description = 'From forest weekends to high-country mornings. Pack a little comfort for the places that feel a world away.',
  imageSrc = '/images/shop/shop-hero-panorama.jpg',
  imageAlt = 'Mountain ridge view with campsite during sunrise',
}: ProductNarrativeBannerProps) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-md mb-12 sm:mb-16 min-h-[220px] sm:min-h-[280px] flex items-center bg-slate-900"
      data-purpose="pdp-narrative-banner"
    >
      {/* Background Scenic Landscape */}
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        sizes="(max-width: 1280px) 100vw, 1280px"
        className="object-cover object-center pointer-events-none select-none"
      />

      {/* Dark overlay for legible contrast */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Banner Copy */}
      <div className="relative z-10 px-6 sm:px-12 py-8 max-w-xl text-white">
        <span className="inline-block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#f97316] bg-black/50 px-2.5 py-0.5 rounded-sm backdrop-blur-sm mb-3 select-none">
          {kicker}
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2.5 leading-tight font-sans">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
          {description}
        </p>
      </div>
    </div>
  );
}
