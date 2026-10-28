'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface HeaderProps {
  /** Optional slot for custom or injected utility actions */
  actions?: React.ReactNode;
}

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '#catalog' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
] as const;

export function Header({ actions }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (

    <header className="absolute top-0 left-0 right-0 z-30 w-full py-3.5 sm:py-4 lg:py-5 bg-gradient-to-r from-[#011323]/0 to-[#011323]/70 backdrop-blur-md border-b border-white/10 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          {/* Brand Logo & Desktop Primary Navigation */}
          <div className="flex items-center gap-6 sm:gap-8 lg:gap-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 sm:gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 rounded-sm"
              aria-label="ALTITUDE Home"
            >
              {/* Brand Logo Image from public/images/altitude-logo.png */}
              <Image
                src="/images/altitude-logo.png"
                alt=""
                width={40}
                height={45}
                className="h-8 w-auto sm:h-9 lg:h-10 object-contain select-none pointer-events-none transition-transform duration-200 group-hover:scale-105"
                priority
              />
              {/* Wordmark (hidden on mobile < 640px to match mobile design reference) */}
              <span className="hidden sm:inline text-xl sm:text-2xl lg:text-[26px] font-black tracking-wider text-white font-sans uppercase drop-shadow-sm">
                ALTITUDE
              </span>
            </Link>

            {/* Desktop Navigation Links (hidden on tablet & mobile to match references) */}
            <nav
              aria-label="Main Navigation"
              className="hidden lg:flex items-center gap-6 lg:gap-8"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-white/90 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 rounded-sm drop-shadow-xs"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Header Cluster: Utility Icons & Mobile Menu Toggle */}
          <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
            {/* Custom injected actions if provided */}
            {actions}

            {/* Utility Icons from public/images/hero svgs/ */}
            <div className="flex items-center gap-3 sm:gap-4 lg:gap-5">
              {/* Search */}
              <Link
                href="#catalog"
                className="p-1 sm:p-1.5 text-white/90 hover:text-white transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 rounded-sm"
                aria-label="Search catalog"
              >
                <Image
                  src="/images/hero svgs/search.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="w-5 h-5 object-contain"
                />
              </Link>

              {/* Account / Person */}
              <Link
                href="#about"
                className="p-1 sm:p-1.5 text-white/90 hover:text-white transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 rounded-sm"
                aria-label="User Account"
              >
                <Image
                  src="/images/hero svgs/person.svg"
                  alt=""
                  width={24}
                  height={24}
                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                />
              </Link>

              {/* Cart */}
              <Link
                href="#catalog"
                className="p-1 sm:p-1.5 text-white/90 hover:text-white transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 rounded-sm"
                aria-label="Shopping Cart"
              >
                <Image
                  src="/images/hero svgs/cart.svg"
                  alt=""
                  width={24}
                  height={24}
                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                />
              </Link>
            </div>

            {/* Mobile & Tablet Hamburger Menu Toggle (< 1024px) */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-1 sm:p-1.5 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 rounded-sm"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Collapsible Mobile Navigation Drawer */}
        {isMenuOpen && (
          <div
            id="mobile-navigation"
            className="lg:hidden mt-3 p-5 bg-[#0a1829]/95 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <nav aria-label="Mobile Navigation" className="flex flex-col space-y-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-base font-semibold text-white/90 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/10"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
