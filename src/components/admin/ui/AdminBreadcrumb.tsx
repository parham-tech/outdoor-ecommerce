import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { AdminBreadcrumbItem } from '@/types/admin';

export interface AdminBreadcrumbProps {
  items: AdminBreadcrumbItem[];
  className?: string;
}

export function AdminBreadcrumb({ items, className }: AdminBreadcrumbProps) {
  return (
    <nav
      aria-label="Admin Breadcrumb"
      className={cn('flex items-center text-xs text-slate-400 font-medium', className)}
    >
      <ol className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap">
        <li>
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded p-0.5"
            aria-label="Admin Dashboard Home"
          >
            <Home className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Console</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center space-x-1.5 sm:space-x-2">
              <ChevronRight
                className="w-3 h-3 text-slate-600 shrink-0"
                aria-hidden="true"
              />
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-slate-400 hover:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded p-0.5"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="text-slate-200 font-semibold truncate max-w-[200px]"
                  aria-current={isLast || item.current ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
