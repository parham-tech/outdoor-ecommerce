import React from 'react';
import Image from 'next/image';

export interface ShopHeroBannerProps {
  kicker?: string;
  title?: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
}

export function ShopHeroBanner({
  kicker = 'GEAR FOR EVERY JOURNEY',
  title = 'All gear',
  description = 'From the first mile to the last light. Find your next adventure essential.',
  imageSrc = '/images/shop/shop-hero-panorama.jpg',
  imageAlt = 'Mountain sunset panorama with tent and campfire in alpine wilderness',
}: ShopHeroBannerProps) {
  return (
    <section
      aria-label="Shop Hero Banner"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 w-full"
      data-purpose="hero-banner"
    >
      <div className="relative rounded-2xl overflow-hidden shadow-lg h-64 sm:h-80 md:h-[340px] flex items-center bg-slate-900">
        {/* Panoramic Mountain Background Image */}
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover object-center pointer-events-none select-none"
        />

        {/* Subtle Dark Overlay Gradient for text readability */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/45 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* Hero Text Content */}
        <div className="relative z-10 px-6 sm:px-12 max-w-2xl text-white">
          <span className="inline-block text-[#f97316] text-xs font-black tracking-widest uppercase mb-2 select-none">
            {kicker}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3 text-white font-sans">
            {title}
          </h1>
          <p className="text-slate-200 text-sm sm:text-base font-normal max-w-lg leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
