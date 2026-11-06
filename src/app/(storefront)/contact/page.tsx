import React from 'react';
import { Metadata } from 'next';
import { ContactHero } from '@/components/contact/ContactHero';
import { ContactMainSection } from '@/components/contact/ContactMainSection';
import { ContactQuickHelp } from '@/components/contact/ContactQuickHelp';

export const metadata: Metadata = {
  title: 'Contact Us — ALTITUDE Gear',
  description:
    'Have a question about ALTITUDE gear, specifications, or your backcountry setup? Reach out to our team or explore our equipment guides.',
  openGraph: {
    title: 'Contact Us — ALTITUDE Gear',
    description:
      'Have a question about ALTITUDE gear, specifications, or your backcountry setup? Reach out to our team or explore our equipment guides.',
    images: [{ url: '/images/shop/shop-hero-panorama.jpg', alt: 'ALTITUDE Outdoor Panorama' }],
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 antialiased selection:bg-orange-500 selection:text-white">
      {/* Main Page Content */}
      <main id="main-content" className="flex-1 flex flex-col">
        {/* Section 1: Hero Banner */}
        <ContactHero />

        {/* Section 2: Main Content (2-Column Form & Info Card) */}
        <ContactMainSection />

        {/* Section 3: Quick Help Self-Service Navigation */}
        <ContactQuickHelp />
      </main>
    </div>
  );
}
