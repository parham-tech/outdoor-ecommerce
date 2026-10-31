import React from 'react';
import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface ShopBreadcrumbsProps {
  items?: BreadcrumbItem[];
}

export function ShopBreadcrumbs({
  items = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'All gear' },
  ],
}: ShopBreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumbs"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-xs text-slate-500 font-medium w-full"
      data-purpose="breadcrumbs"
    >
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={item.label}>
              {index > 0 && (
                <li aria-hidden="true">
                  <span className="text-slate-400 select-none">›</span>
                </li>
              )}
              <li>
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="hover:text-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-xs"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className="text-slate-900 font-bold"
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
