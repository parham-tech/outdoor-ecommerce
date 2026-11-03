'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface HeaderProps {
  /** Optional slot for custom or injected utility actions */
  actions?: React.ReactNode;
  /** Visual display variant: transparent for hero overlays or solid for catalog pages */
  variant?: 'transparent' | 'solid';
  /** Currently active link href to highlight with the orange indicator */
  activeHref?: string;
  /** Cart item count badge; defaults to 0 */
  cartCount?: number;
}

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/#contact' },
] as const;

export function Header({
  actions,
  variant = 'transparent',
  activeHref,
  cartCount = 0,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isSolid = variant === 'solid';

  const containerClass = isSolid
    ? 'sticky top-0 z-50 w-full bg-[#0b121c] text-white shadow-md'
    : 'absolute top-0 left-0 right-0 z-30 w-full py-3.5 sm:py-4 lg:py-5 bg-gradient-to-r from-[#011323]/0 to-[#011323]/70 backdrop-blur-md border-b border-white/10 shadow-xs transition-colors duration-200';

  return (
    <header className={containerClass}>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isSolid ? 'h-20 flex items-center justify-between gap-4' : ''}`}>
        <div className={`flex items-center justify-between w-full ${!isSolid ? '' : ''}`}>
          {/* Brand Logo & Desktop Primary Navigation */}
          <div className="flex items-center gap-6 sm:gap-8 lg:gap-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 sm:gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b121c] rounded-sm flex-shrink-0"
              aria-label="ALTITUDE Home"
            >
              {/* Brand Logo Image from public/images/altitude-logo.png */}
              <Image
                src="/images/altitude-logo.png"
                alt=""
                width={36}
                height={40}
                className="h-8 w-auto sm:h-9 object-contain select-none pointer-events-none transition-transform duration-200 group-hover:scale-105"
                priority
              />
              {/* Wordmark */}
              <span className="text-xl sm:text-2xl font-black tracking-wider text-white font-sans uppercase">
                ALTITUDE
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav
              aria-label="Main Navigation"
              className="hidden md:flex items-center space-x-8 text-sm font-semibold tracking-wide"
            >
              {NAV_LINKS.map((link) => {
                const isActive = activeHref === link.href || (activeHref === undefined && link.href === '/shop' && isSolid);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`relative py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-sm ${
                      isActive
                        ? 'text-[#f97316] font-bold'
                        : isSolid
                        ? 'text-slate-300 hover:text-white'
                        : 'text-white/90 hover:text-white'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-0 w-full h-[2px] bg-[#f97316] rounded-full"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Header Cluster: Search & User Actions */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 md:flex-initial justify-end">
            {/* Custom injected actions if provided */}
            {actions}

            {/* In-header Search Input (Visible in solid mode on sm+ screens) */}
            {isSolid && (
              <div className="relative w-full max-w-xs hidden sm:block">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400" aria-hidden="true">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search gear for your next trip"
                  className="w-full bg-[#16212e] text-slate-200 placeholder-slate-400 text-xs rounded-full pl-10 pr-4 py-2 border border-slate-700/60 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  aria-label="Search gear"
                />
              </div>
            )}

            {/* Utility Icons from public/images/hero svgs/ */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Toggle for Mobile or transparent mode */}
              {!isSolid && (
                <Link
                  href="/shop"
                  className="p-1 sm:p-1.5 text-white/90 hover:text-white transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-sm"
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
              )}

              {/* Account */}
              <Link
                href="/#about"
                className="p-1 sm:p-1.5 text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-sm"
                aria-label="Account"
                title="Account"
              >
                <Image
                  src="/images/hero svgs/person.svg"
                  alt=""
                  width={22}
                  height={22}
                  className="w-5 h-5 object-contain"
                />
              </Link>

              {/* Cart Bag with Badge */}
              <Link
                href="/shop#catalog"
                className="flex items-center gap-1.5 p-1 sm:p-1.5 text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-sm"
                aria-label={`Shopping cart with ${cartCount} items`}
                title="Cart"
              >
                <div className="relative">
                  <Image
                    src="/images/hero svgs/cart.svg"
                    alt=""
                    width={22}
                    height={22}
                    className="w-5 h-5 object-contain"
                  />
                </div>
                <span className="text-sm font-semibold text-slate-200">
                  {cartCount}
                </span>
              </Link>
            </div>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-1 sm:p-1.5 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-sm"
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
            className="md:hidden mt-3 p-5 bg-[#0a1829]/95 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <nav aria-label="Mobile Navigation" className="flex flex-col space-y-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-base font-semibold py-2 px-3 rounded-lg transition-colors ${
                    activeHref === link.href
                      ? 'text-[#f97316] bg-white/5 font-bold'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
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

