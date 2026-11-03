import React from 'react';
import { ContactForm } from './ContactForm';
import { ContactInfoCard } from './ContactInfoCard';

export function ContactMainSection() {
  return (
    <section
      aria-label="Contact Form and Information"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 w-full"
      data-purpose="contact-main-section"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Contact Form Column (7 cols on desktop) */}
        <div className="lg:col-span-7">
          <ContactForm />
        </div>

        {/* Brand Information Panel Column (5 cols on desktop) */}
        <div className="lg:col-span-5">
          <ContactInfoCard />
        </div>
      </div>
    </section>
  );
}
