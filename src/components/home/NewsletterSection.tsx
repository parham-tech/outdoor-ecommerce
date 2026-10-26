'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitted' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmed = email.trim();

    if (!trimmed || !emailRegex.test(trimmed)) {
      setStatus('error');
      setFeedbackMessage('Please enter a valid email address.');
      return;
    }

    // Honest feedback without fake backend claims
    setStatus('submitted');
    setFeedbackMessage('Newsletter subscriptions are coming soon. Thank you for your interest!');
    setEmail('');
  };

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="relative w-full min-h-[260px] sm:min-h-[300px] lg:min-h-[340px] flex items-center justify-center overflow-hidden"
    >
      {/* Twilight Mountain Panorama Clean Background Photograph */}
      <Image
        src="/images/newsletter-banner.png"
        alt="Panoramic twilight mountain ridges with sunset glow"
        fill
        sizes="100vw"
        className="object-cover pointer-events-none select-none"
        style={{ objectPosition: 'center 32%' }}
      />

      {/* Lightweight Contrast Scrim: Preserves Original Photography with High WCAG AA Contrast */}
      <div
        className="absolute inset-0 bg-black/20 pointer-events-none"
        aria-hidden="true"
      />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 sm:px-8 py-10 sm:py-14 lg:py-16 text-center flex flex-col items-center">
        {/* Main Heading */}
        <h2
          id="newsletter-heading"
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white uppercase tracking-tight leading-tight font-sans mb-2.5 sm:mb-3 drop-shadow-sm"
        >
          READY FOR YOUR NEXT ADVENTURE
        </h2>

        {/* Description */}
        <p className="text-sm sm:text-base md:text-lg text-white/90 font-medium leading-relaxed font-sans mb-6 sm:mb-8 max-w-2xl drop-shadow-sm">
          Get exclusive offers, new arrivals and outdoor inspiration
        </p>

        {/* Newsletter Subscription Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xl mx-auto"
          noValidate
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-2xl sm:rounded-full p-1.5 shadow-2xl transition-all duration-200 focus-within:ring-2 focus-within:ring-amber-400 focus-within:ring-offset-2 focus-within:ring-offset-[#0A131F]">
            <label htmlFor="newsletter-email" className="sr-only">
              Your Email Address
            </label>
            <input
              id="newsletter-email"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status !== 'idle') setStatus('idle');
              }}
              placeholder="Your Email Address"
              required
              className="flex-1 bg-transparent px-4 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base text-[#1C3323] placeholder:text-neutral-400 focus:outline-none min-w-0"
            />
            <button
              type="submit"
              aria-label="Join the journey newsletter"
              className="bg-[#FA7109] hover:bg-[#EA580C] active:bg-[#C2410C] text-white font-bold text-xs sm:text-sm uppercase tracking-wider px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-full transition-all duration-200 shrink-0 shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 select-none cursor-pointer"
            >
              JOIN THE JOURNEY
            </button>
          </div>

          {/* Accessible Status & Honest Feedback Container */}
          <div
            aria-live="polite"
            className="mt-3 min-h-[22px] text-xs sm:text-sm text-center"
          >
            {status === 'error' && (
              <p className="text-amber-300 font-medium">
                {feedbackMessage}
              </p>
            )}
            {status === 'submitted' && (
              <p className="text-emerald-300 font-medium">
                {feedbackMessage}
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
