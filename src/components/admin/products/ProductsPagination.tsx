'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ProductsPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function ProductsPagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: ProductsPaginationProps) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate numbered pages (up to 5 buttons around current page)
  const pageNumbers: number[] = [];
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, startPage + maxButtons - 1);

  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 text-xs sm:text-sm text-slate-400">
      {/* Left: Range and Page Size selector */}
      <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
        <p>
          Showing <span className="font-semibold text-slate-200 font-mono">{startItem}</span> to{' '}
          <span className="font-semibold text-slate-200 font-mono">{endItem}</span> of{' '}
          <span className="font-semibold text-white font-mono">{totalItems}</span> products
        </p>

        <div className="flex items-center gap-2">
          <label htmlFor="page-size-select" className="text-xs text-slate-400 whitespace-nowrap">
            Per page:
          </label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
          >
            <option value={8}>8</option>
            <option value={16}>16</option>
            <option value={24}>24</option>
          </select>
        </div>
      </div>

      {/* Right: Page navigation buttons */}
      <nav aria-label="Products pagination" className="flex items-center gap-1.5">
        {/* Previous Page Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className={cn(
            'inline-flex items-center justify-center p-1.5 rounded-lg border text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
            currentPage === 1
              ? 'border-slate-800 text-slate-600 cursor-not-allowed'
              : 'border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer'
          )}
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Numbered Page Buttons */}
        {pageNumbers.map((page) => {
          const isCurrent = page === currentPage;
          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-current={isCurrent ? 'page' : undefined}
              className={cn(
                'min-w-8 h-8 px-2 rounded-lg text-xs font-semibold font-mono transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer',
                isCurrent
                  ? 'bg-orange-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              {page}
            </button>
          );
        })}

        {/* Next Page Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          className={cn(
            'inline-flex items-center justify-center p-1.5 rounded-lg border text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
            currentPage >= totalPages
              ? 'border-slate-800 text-slate-600 cursor-not-allowed'
              : 'border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer'
          )}
        >
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
}
