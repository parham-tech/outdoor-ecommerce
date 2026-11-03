import React from 'react';
import Image from 'next/image';

export interface ContactHeroProps {
  kicker?: string;
  title?: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
}

export function ContactHero({
  kicker = 'GET IN TOUCH',
  title = "WE'RE HERE TO HELP",
  description = 'Have a question about gear specifications, sizing, or your outdoor setup? Send our team a message or browse our existing guides.',
  imageSrc = '/images/shop/shop-hero-panorama.jpg',
  imageAlt = 'Panoramic view of alpine mountains at dusk',
}: ContactHeroProps) {
  return (
    <section
      aria-label="Contact Altitude Hero"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6 sm:pb-8 w-full"
      data-purpose="contact-hero"
    >
      <div className="relative rounded-2xl overflow-hidden shadow-md min-h-[220px] sm:min-h-[260px] lg:min-h-[280px] flex items-center bg-slate-900">
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
          className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/25 sm:to-black/10 pointer-events-none"
          aria-hidden="true"
        />

        {/* Hero Content */}
        <div className="relative z-10 px-6 sm:px-10 lg:px-12 py-8 max-w-2xl text-white">
          <span className="inline-block text-xs sm:text-sm font-bold tracking-widest text-[#f97316] uppercase mb-2 select-none">
            {kicker}
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase text-white tracking-tight leading-tight font-sans mb-2.5 sm:mb-3">
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
