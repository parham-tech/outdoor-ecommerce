import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

export interface HeaderProps {
  /** Optional slot for future utility actions (cart, search, auth) in Phase 06 */
  actions?: React.ReactNode;
}

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '#catalog' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
] as const;

export function Header({ actions }: HeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 w-full py-5 sm:py-6">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          {/* Brand Logo & Primary Navigation Group */}
          <div className="flex items-center gap-8 sm:gap-10">
            <Link
              href="/"
              className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 rounded-sm"
              aria-label="Ridge & River Home"
            >
              <Logo className="w-9 h-6 sm:w-10 sm:h-7 text-white" />
            </Link>

            <nav aria-label="Main Navigation" className="flex items-center gap-6 sm:gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-white/90 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 rounded-sm"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Reserved modular slot for future utility actions (Phase 06: Cart, Search, Auth) */}
          <div className="flex items-center gap-4">
            {actions ?? null}
          </div>
        </div>
      </div>
    </header>
  );
}
