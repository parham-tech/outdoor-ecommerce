import React from 'react';
import { Metadata } from 'next';
import { AboutHero } from '@/components/about/AboutHero';
import { AboutStory } from '@/components/about/AboutStory';
import { AboutValues } from '@/components/about/AboutValues';
import { AboutCtaBanner } from '@/components/about/AboutCtaBanner';

export const metadata: Metadata = {
  title: 'About Us — ALTITUDE Gear',
  description:
    'Discover the design principles and outdoor ethos behind ALTITUDE equipment. Purpose-built gear crafted for the backcountry.',
  openGraph: {
    title: 'About Us — ALTITUDE Gear',
    description:
      'Discover the design principles and outdoor ethos behind ALTITUDE equipment. Purpose-built gear crafted for the backcountry.',
    images: [{ url: '/images/shop/shop-hero-panorama.jpg', alt: 'ALTITUDE Outdoor Panorama' }],
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 antialiased selection:bg-orange-500 selection:text-white">
      {/* Main Page Content */}
      <main id="main-content" className="flex-1 flex flex-col">
        {/* Section 1: Hero Banner */}
        <AboutHero />

        {/* Section 2: Our Story Narrative */}
        <AboutStory />

        {/* Section 3: Our Brand Design Principles */}
        <AboutValues />

        {/* Section 4: Call to Action Banner leading to /shop */}
        <AboutCtaBanner ctaHref="/shop" />
      </main>
    </div>
  );
}
