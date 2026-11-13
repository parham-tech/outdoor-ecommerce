'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

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
  { label: 'Contact', href: '/contact' },
] as const;

export function Header({
  actions,
  activeHref,
  cartCount: controlledCartCount,
}: HeaderProps) {
  const pathname = usePathname();
  const { itemCount, openDrawer, isHydrated } = useCart();
  const { isAuthenticated, customer } = useCustomerAuth();
  const displayCartCount = isHydrated ? (controlledCartCount ?? itemCount) : 0;
  const accountHref = isAuthenticated ? '/account' : '/login';
  const accountTitle = isAuthenticated
    ? `My Account (${customer?.fullName || 'Customer'})`
    : 'Sign In';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const drawerCloseButtonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);

  // Natural scroll: Header participates in normal document flow with relative positioning
  // Solid midnight navy background and shadow matching Shop, About, and Contact pages
  const containerClass = 'relative z-30 w-full bg-[#0b121c] text-white shadow-md';

  // Close overlays on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMenuOpen) {
          setIsMenuOpen(false);
          menuButtonRef.current?.focus();
        }
        if (isSearchOpen) {
          setIsSearchOpen(false);
          searchButtonRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen, isSearchOpen]);

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    if (isMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMenuOpen]);

  // Auto-close mobile drawer when window resizes to desktop breakpoint (>= 768px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set focus into drawer when opened
  useEffect(() => {
    if (isMenuOpen) {
      drawerCloseButtonRef.current?.focus();
    }
  }, [isMenuOpen]);

  // Focus search input when search panel opens
  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <header className={containerClass}>
      {/* Main Top Header Bar */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full h-20">
          {/* Brand Logo & Desktop Primary Navigation on LEFT */}
          <div className="flex items-center gap-3 sm:gap-6 lg:gap-10 shrink-0">
            <Link
              href="/"
              className="inline-flex items-center gap-2 sm:gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b121c] rounded-sm shrink-0"
              aria-label="ALTITUDE Home"
            >
              {/* Brand Logo Image */}
              <Image
                src="/images/altitude-logo.png"
                alt=""
                width={36}
                height={40}
                className="h-7 w-auto sm:h-9 object-contain select-none pointer-events-none transition-transform duration-200 group-hover:scale-105 shrink-0"
                priority
              />
              {/* Wordmark */}
              <span className="text-lg sm:text-2xl font-black tracking-wider text-white font-sans uppercase shrink-0">
                ALTITUDE
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav
              aria-label="Main Navigation"
              className="hidden md:flex items-center space-x-6 lg:space-x-8 text-sm font-semibold tracking-wide"
            >
              {NAV_LINKS.map((link) => {
                const isActive =
                  activeHref !== undefined
                    ? activeHref === link.href
                    : link.href === '/'
                    ? pathname === '/'
                    : pathname === link.href || (link.href === '/shop' && pathname.startsWith('/products'));
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`relative py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-sm ${
                      isActive
                        ? 'text-[#f97316] font-bold'
                        : 'text-slate-300 hover:text-white'
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

          {/* Right Header Cluster: Search, Account, Cart, Menu */}
          <div className="flex items-center gap-1 sm:gap-2.5 md:gap-3 shrink-0 justify-end">
            {/* Custom injected actions if provided */}
            {actions}

            {/* In-header Search Input (Visible on desktop md+ screens) */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative w-44 lg:w-64 hidden md:block shrink-0"
            >
              <span
                className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"
                aria-hidden="true"
              >
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
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gear..."
                className="w-full bg-[#16212e] text-slate-200 placeholder-slate-400 text-xs rounded-full pl-9 pr-3 py-2 border border-slate-700/60 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                aria-label="Search gear"
              />
            </form>

            {/* Search SVG Toggle Button (Mobile) */}
            <button
              ref={searchButtonRef}
              type="button"
              onClick={() => {
                setIsSearchOpen((prev) => {
                  const next = !prev;
                  if (next) setIsMenuOpen(false);
                  return next;
                });
              }}
              className="md:hidden p-1.5 sm:p-2 text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-sm shrink-0"
              aria-label={isSearchOpen ? 'Close search' : 'Open search'}
              aria-expanded={isSearchOpen}
            >
              <Image
                src="/images/hero svgs/search.svg"
                alt=""
                width={20}
                height={20}
                className="w-5 h-5 shrink-0 object-contain"
              />
            </button>

            {/* Account Icon */}
            <Link
              href={accountHref}
              className="p-1.5 sm:p-2 text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-sm shrink-0"
              aria-label={accountTitle}
              title={accountTitle}
            >
              <Image
                src="/images/hero svgs/person.svg"
                alt=""
                width={22}
                height={22}
                className="w-5 h-5 shrink-0 object-contain"
              />
            </Link>

            {/* Cart Bag with Badge */}
            <button
              type="button"
              onClick={openDrawer}
              className="flex items-center gap-1.5 p-1.5 sm:p-2 text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-sm shrink-0 cursor-pointer"
              aria-label={`Open shopping cart with ${displayCartCount} items`}
              title="Cart"
            >
              <div className="relative shrink-0">
                <Image
                  src="/images/hero svgs/cart.svg"
                  alt=""
                  width={22}
                  height={22}
                  className="w-5 h-5 shrink-0 object-contain"
                />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-slate-200 shrink-0">
                {displayCartCount}
              </span>
            </button>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => {
                setIsMenuOpen((prev) => {
                  const next = !prev;
                  if (next) setIsSearchOpen(false);
                  return next;
                });
              }}
              className="md:hidden p-1.5 sm:p-2 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-sm shrink-0"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
            >
              <svg
                className="w-6 h-6 shrink-0"
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
      </div>

      {/* Mobile/Compact Search Dropdown Panel (Positioned below Header bar) */}
      {isSearchOpen && (
        <div
          ref={searchPanelRef}
          className="w-full bg-[#0b121c]/98 backdrop-blur-md border-t border-b border-white/10 px-4 py-3 sm:px-6 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150"
          role="search"
          aria-label="Mobile Search"
        >
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-xl mx-auto flex items-center gap-2"
          >
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
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
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gear for your next trip..."
                className="w-full bg-[#16212e] text-slate-100 placeholder-slate-400 text-xs sm:text-sm rounded-lg pl-9 pr-3 py-2.5 border border-slate-700/80 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                aria-label="Search gear query"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs rounded-lg uppercase tracking-wider transition-colors shrink-0"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(false);
                searchButtonRef.current?.focus();
              }}
              className="p-2 text-slate-400 hover:text-white rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 shrink-0"
              aria-label="Close search field"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Mobile Navigation Drawer Overlay (Does NOT participate in Header flex layout) */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Menu"
        >
          {/* Dark Backdrop Scrim */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => {
              setIsMenuOpen(false);
              menuButtonRef.current?.focus();
            }}
            aria-hidden="true"
          />

          {/* Drawer Panel on Right */}
          <div
            ref={drawerRef}
            id="mobile-navigation"
            className="fixed top-0 right-0 bottom-0 w-[85vw] max-w-xs sm:max-w-sm h-full max-h-[100vh] max-h-[100dvh] bg-[#0b121c] border-l border-white/10 shadow-2xl flex flex-col justify-between overflow-y-auto p-5 sm:p-6 transition-transform duration-200 ease-out animate-in slide-in-from-right"
          >
            {/* Drawer Top Row: Logo & Close Button */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <Image
                  src="/images/altitude-logo.png"
                  alt=""
                  width={28}
                  height={32}
                  className="h-7 w-auto object-contain"
                />
                <span className="text-lg font-black tracking-wider text-white uppercase">
                  ALTITUDE
                </span>
              </div>
              <button
                ref={drawerCloseButtonRef}
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  menuButtonRef.current?.focus();
                }}
                className="p-2 text-slate-400 hover:text-white rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                aria-label="Close navigation menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Primary Navigation Links with Comfortable 48px Touch Targets */}
            <nav aria-label="Mobile Navigation Links" className="flex-1 py-5 space-y-1.5 overflow-y-auto">
              {NAV_LINKS.map((link) => {
                const isActive =
                  activeHref !== undefined
                    ? activeHref === link.href
                    : link.href === '/'
                    ? pathname === '/'
                    : pathname === link.href || (link.href === '/shop' && pathname.startsWith('/products'));
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center justify-between py-3 px-4 rounded-xl text-base font-semibold transition-colors min-h-[48px] ${
                      isActive
                        ? 'text-[#f97316] bg-white/5 font-bold border-l-2 border-[#f97316]'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{link.label}</span>
                    <span className="text-slate-500 text-sm" aria-hidden="true">
                      →
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* Drawer Footer with Quick Utilities */}
            <div className="pt-4 border-t border-white/10 text-xs text-slate-400 space-y-2 shrink-0">
              <Link
                href={accountHref}
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-slate-300 hover:bg-white/5 transition-colors min-h-[44px]"
              >
                <span className="flex items-center gap-2 font-medium">
                  <Image
                    src="/images/hero svgs/person.svg"
                    alt=""
                    width={18}
                    height={18}
                    className="w-4 h-4 object-contain shrink-0"
                  />
                  {isAuthenticated ? 'My Account' : 'Sign In'}
                </span>
                {isAuthenticated && (
                  <span className="text-[11px] text-orange-400 font-semibold truncate max-w-[120px]">
                    {customer?.fullName}
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  openDrawer();
                }}
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-slate-300 hover:bg-white/5 transition-colors min-h-[44px] cursor-pointer"
                aria-label={`Open shopping cart with ${displayCartCount} items`}
              >
                <span className="flex items-center gap-2 font-medium">
                  <Image
                    src="/images/hero svgs/cart.svg"
                    alt=""
                    width={18}
                    height={18}
                    className="w-4 h-4 object-contain shrink-0"
                  />
                  Shopping Cart
                </span>
                <span className="font-bold text-white bg-orange-600 px-2 py-0.5 rounded-full text-[11px]">
                  {displayCartCount} {displayCartCount === 1 ? 'item' : 'items'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
