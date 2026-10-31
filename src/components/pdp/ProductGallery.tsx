'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ProductGalleryImage, ProductQuickMetric } from '@/types/product';

export interface ProductGalleryProps {
  primaryImage: string;
  imageAlt: string;
  badge?: string;
  galleryImages?: ProductGalleryImage[];
  quickMetrics?: ProductQuickMetric[];
}

export function ProductGallery({
  primaryImage,
  imageAlt,
  badge,
  galleryImages = [],
  quickMetrics = [],
}: ProductGalleryProps) {
  // Consolidate images list: default to primary image if no separate gallery array is given
  const images = galleryImages.length > 0 ? galleryImages : [{ src: primaryImage, alt: imageAlt }];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const currentImage = images[activeIndex] ?? images[0];

  return (
    <section aria-label="Product Media Gallery" className="flex flex-col gap-4 w-full" data-purpose="product-gallery">
      {/* Main Showcase Image Container */}
      <div className="relative bg-[#f8f9fa] rounded-2xl overflow-hidden border border-slate-200/80 flex items-center justify-center p-6 sm:p-10 min-h-[320px] sm:min-h-[440px] group">
        {/* Badge Overlay */}
        {badge && (
          <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm border border-slate-200/90 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded shadow-xs text-slate-800 select-none">
            {badge}
          </div>
        )}

        {/* Main Product Image */}
        <div
          className={`relative w-full h-72 sm:h-96 flex items-center justify-center transition-transform duration-300 ${
            isZoomed ? 'scale-125 cursor-zoom-out' : 'group-hover:scale-105 cursor-zoom-in'
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <Image
            src={currentImage.src}
            alt={currentImage.alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-contain mix-blend-multiply select-none pointer-events-none p-2 sm:p-4"
          />
        </div>

        {/* Zoom Toggle Button */}
        <button
          type="button"
          onClick={() => setIsZoomed(!isZoomed)}
          className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-slate-700 p-2 rounded-full border border-slate-200 shadow-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          aria-label={isZoomed ? 'Zoom out image' : 'Zoom in image'}
          title={isZoomed ? 'Zoom out' : 'Zoom in'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {isZoomed ? (
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            ) : (
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            )}
          </svg>
        </button>
      </div>

      {/* Thumbnails Rail (Only rendered when multiple verified photos exist) */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={`${img.src}-${idx}`}
                type="button"
                onClick={() => {
                  setActiveIndex(idx);
                  setIsZoomed(false);
                }}
                className={`relative aspect-[4/3] rounded-lg p-1.5 bg-[#f8f9fa] overflow-hidden focus:outline-none transition-all ${
                  isActive
                    ? 'border-2 border-orange-500 shadow-xs ring-1 ring-orange-500/30'
                    : 'border border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
                }`}
                aria-label={`View photo ${idx + 1} of ${images.length}`}
                aria-current={isActive ? 'true' : undefined}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="120px"
                  className="object-contain mix-blend-multiply p-1 pointer-events-none select-none"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Gallery Metadata Subline */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>{currentImage.label ?? imageAlt}</span>
        <span>
          {activeIndex + 1} / {images.length}
        </span>
      </div>

      {/* 3 Quick Metrics Highlight Strip */}
      {quickMetrics.length > 0 && (
        <div className={`grid grid-cols-${quickMetrics.length} gap-4 pt-4 border-t border-slate-100 mt-2 text-center`}>
          {quickMetrics.map((metric, idx) => (
            <div
              key={metric.label}
              className={`py-1 ${idx > 0 && idx < quickMetrics.length - 1 ? 'border-x border-slate-100' : ''}`}
            >
              <span className="block text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                {metric.value}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                {metric.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
