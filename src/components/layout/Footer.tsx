import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const SHOP_LINKS = [
  { label: 'Tents & Shelters', href: '/#featured-categories-heading' },
  { label: 'backpacks', href: '/#featured-categories-heading' },
  { label: 'Camping Kitchen', href: '/#featured-categories-heading' },
  { label: 'Lightning', href: '/#featured-categories-heading' },
] as const;

const ABOUT_LINKS = [
  { label: 'Our Story', href: '/#lifestyle-banner-heading' },
  { label: 'Sustainablity', href: '/#go-further-banner-heading' },
  { label: 'Blog', href: '/#featured-products-heading' },
  { label: 'Contact', href: '/#newsletter-heading' },
] as const;

const SUPPORT_LINKS = [
  { label: 'Shipping', href: '/#main-content' },
  { label: 'Return', href: '/#main-content' },
  { label: 'FAQ', href: '/#main-content' },
  { label: 'Customer Service', href: '/#newsletter-heading' },
] as const;

const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    href: 'https://instagram.com',
    iconSrc: '/images/footer/instagram.png',
  },
  {
    name: 'Telegram',
    href: 'https://t.me',
    iconSrc: '/images/footer/telegram.png',
  },
  {
    name: 'Facebook',
    href: 'https://facebook.com',
    iconSrc: '/images/footer/facebook.png',
  },
] as const;

export function Footer() {
  return (
    <footer
      aria-labelledby="footer-heading"
      className="w-full bg-[#011323] text-white selection:bg-[#FA7109] selection:text-white"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-12 sm:pt-14 pb-8">
        {/* Main 5-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-12 pb-10 sm:pb-12">
          {/* Column 1: Brand & Logo */}
          <div className="sm:col-span-2 md:col-span-1 lg:col-span-1 flex flex-col items-start">
            <Link
              href="/"
              className="inline-flex items-center gap-3.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#011323] rounded-sm"
              aria-label="ALTITUDE Home"
            >
              <Image
                src="/images/footer/altitude-logo.png"
                alt=""
                width={36}
                height={40}
                className="w-8 h-9 object-contain select-none pointer-events-none"
              />
              <span className="text-xl sm:text-2xl font-extrabold tracking-wider text-white font-sans uppercase">
                ALTITUDE
              </span>
            </Link>
          </div>

          {/* Column 2: Shop */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 sm:mb-4 font-sans">
              Shop
            </h3>
            <ul className="space-y-2 sm:space-y-2.5">
              {SHOP_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-slate-300 hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: About */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 sm:mb-4 font-sans">
              About
            </h3>
            <ul className="space-y-2 sm:space-y-2.5">
              {ABOUT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-slate-300 hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Support */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 sm:mb-4 font-sans">
              Support
            </h3>
            <ul className="space-y-2 sm:space-y-2.5">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-slate-300 hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Follow Us */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 sm:mb-4 font-sans">
              Follow Us
            </h3>
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow Altitude on ${social.name}`}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <Image
                    src={social.iconSrc}
                    alt=""
                    width={22}
                    height={22}
                    className="w-5 h-5 brightness-0 invert object-contain"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Horizontal Divider */}
        <div className="w-full border-t border-white/10" />

        {/* Sub-Footer / Copyright & Legal */}
        <div className="pt-6 sm:pt-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 ALTITUDE. All rights reserved.</p>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-6 gap-y-2">
            <Link
              href="/#main-content"
              className="hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-sm"
            >
              Privacy policy
            </Link>
            <Link
              href="/#main-content"
              className="hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-sm"
            >
              Terms of service
            </Link>
            <span className="text-slate-400 select-none">
              United States · USD $
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
