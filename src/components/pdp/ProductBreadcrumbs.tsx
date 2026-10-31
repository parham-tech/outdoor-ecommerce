import React from 'react';
import Link from 'next/link';

export interface ProductBreadcrumbsProps {
  category: string;
  productName: string;
}

export function ProductBreadcrumbs({ category, productName }: ProductBreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb navigation"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-xs text-slate-500 font-medium w-full"
      data-purpose="pdp-breadcrumbs"
    >
      <ol className="flex items-center space-x-2 flex-wrap">
        <li>
          <Link
            href="/"
            className="hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-xs"
          >
            Home
          </Link>
        </li>
        <li aria-hidden="true" className="text-slate-300 select-none">
          /
        </li>
        <li>
          <Link
            href="/shop"
            className="hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-xs"
          >
            Shop
          </Link>
        </li>
        <li aria-hidden="true" className="text-slate-300 select-none">
          /
        </li>
        <li>
          <Link
            href="/shop"
            className="hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-xs"
          >
            {category}
          </Link>
        </li>
        <li aria-hidden="true" className="text-slate-300 select-none">
          /
        </li>
        <li
          aria-current="page"
          className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-none"
        >
          {productName}
        </li>
      </ol>
    </nav>
  );
}
