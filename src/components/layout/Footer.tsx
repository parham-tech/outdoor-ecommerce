import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface FooterLinkItem {
  label: string;
  href?: string;
}

const SHOP_LINKS: readonly FooterLinkItem[] = [
  { label: 'Tents & Shelters', href: '/shop?category=tents-shelters' },
  { label: 'Backpacks', href: '/shop?category=backpacks' },
  { label: 'Camping Kitchen', href: '/shop?category=camping-kitchen' },
  { label: 'Lighting', href: '/shop?category=lighting' },
] as const;

const ABOUT_LINKS: readonly FooterLinkItem[] = [
  { label: 'Our Story', href: '/about' },
  { label: 'Sustainablity', href: '/#go-further-banner-heading' },
  { label: 'Blog', href: '/#featured-products-heading' },
  { label: 'Contact', href: '/contact' },
] as const;

const SUPPORT_LINKS: readonly FooterLinkItem[] = [
  { label: 'Shipping' },
  { label: 'Return' },
  { label: 'FAQ' },
  { label: 'Customer Service', href: '/#newsletter-heading' },
] as const;
interface SocialLinkItem {
  name: string;
  href: string;
  iconSrc: string;
  width: number;
  height: number;
  className: string;
}

const SOCIAL_LINKS: readonly SocialLinkItem[] = [
  {
    name: 'Instagram',
    href: 'https://instagram.com',
    iconSrc: '/images/footer/instagram.png',
    width: 28,
    height: 28,
    className: 'w-7 h-7',
  },
  {
    name: 'Telegram',
    href: 'https://t.me',
    iconSrc: '/images/footer/telegram.png',
    width: 22,
    height: 22,
    className: 'w-[22px] h-[22px]',
  },
  {
    name: 'Facebook',
    href: 'https://facebook.com',
    iconSrc: '/images/footer/facebook.png',
    width: 22,
    height: 22,
    className: 'w-[22px] h-[22px]',
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
        {/* Main Grid: Responsive 2-col (Mobile), 4-col (Tablet), 5-col (Desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-8 md:gap-y-10 lg:gap-y-0 gap-x-6 sm:gap-x-8 lg:gap-x-12 pb-10 sm:pb-12">
          {/* Brand & Logo: Full width top row on Mobile (col-span-2) & Tablet (col-span-4), Col 1 on Desktop */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 flex flex-col items-start mb-2 md:mb-4 lg:mb-0">
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

          {/* Shop Column */}
          <div className="col-span-1">
            <h3 className="text-sm sm:text-base font-bold text-white mb-3 sm:mb-4 font-sans">
              Shop
            </h3>
            <ul className="space-y-2 sm:space-y-2.5">
              {SHOP_LINKS.map((link) => (
                <li key={link.label}>
                  {link.href ? (
                    <Link
                      href={link.href}
                      className="text-xs sm:text-sm text-slate-300 hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-sm"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <span className="text-xs sm:text-sm text-slate-300 cursor-default select-none">
                      {link.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* About Column */}
          <div className="col-span-1">
            <h3 className="text-sm sm:text-base font-bold text-white mb-3 sm:mb-4 font-sans">
              About
            </h3>
            <ul className="space-y-2 sm:space-y-2.5">
              {ABOUT_LINKS.map((link) => (
                <li key={link.label}>
                  {link.href ? (
                    <Link
                      href={link.href}
                      className="text-xs sm:text-sm text-slate-300 hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-sm"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <span className="text-xs sm:text-sm text-slate-300 cursor-default select-none">
                      {link.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div className="col-span-1">
            <h3 className="text-sm sm:text-base font-bold text-white mb-3 sm:mb-4 font-sans">
              Support
            </h3>
            <ul className="space-y-2 sm:space-y-2.5">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  {link.href ? (
                    <Link
                      href={link.href}
                      className="text-xs sm:text-sm text-slate-300 hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-sm"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <span className="text-xs sm:text-sm text-slate-300 cursor-default select-none">
                      {link.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Follow Us Column */}
          <div className="col-span-1">
            <h3 className="text-sm sm:text-base font-bold text-white mb-3 sm:mb-4 font-sans">
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
                    width={social.width}
                    height={social.height}
                    className={`${social.className} brightness-0 invert object-contain`}
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Horizontal Divider */}
        <div className="w-full border-t border-white/10" />

        {/* Sub-Footer / Copyright & Legal: Flex stack on Mobile/Tablet, Space-between on Desktop */}
        <div className="pt-6 sm:pt-7 flex flex-col space-y-3 text-left lg:space-y-0 lg:flex-row lg:justify-between lg:items-center text-xs text-slate-400">
          {/* Copyright: Left on Desktop, Line 2 on Mobile/Tablet */}
          <p className="order-2 lg:order-1 select-none">
            © 2026 ALTITUDE. All rights reserved.
          </p>

          {/* Legal Links & Currency: Right on Desktop, Line 1 on Mobile/Tablet */}
          <div className="order-1 lg:order-2 flex flex-wrap items-center gap-x-6 gap-y-2 lg:justify-end">
            <span className="cursor-default select-none">Privacy policy</span>
            <span className="cursor-default select-none">Terms of service</span>
            <span className="select-none">United States - USD $</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
