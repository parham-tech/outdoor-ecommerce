'use client';

import React from 'react';

export interface CategoryPillItem {
  id: string;
  name: string;
  icon: React.ReactNode;
}

export interface ShopCategoryPillsProps {
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
}

export function ShopCategoryPills({
  selectedCategory,
  onSelectCategory,
}: ShopCategoryPillsProps) {
  const categories: CategoryPillItem[] = [
    {
      id: 'all',
      name: 'All gear',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 20l7-14 4 8 3-5 4 11H3z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'tents-shelters',
      name: 'Tents & Shelters',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 21l9-18 9 18H3z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 3v18" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'backpacks',
      name: 'Backpacks',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 8h14M7 8V6a2 2 0 012-2h6a2 2 0 012 2v2m1 13H6a2 2 0 01-2-2V9a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'sleeping-gear',
      name: 'Sleeping gear',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 19V5a2 2 0 012-2h12a2 2 0 012 2v14M4 15h16" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'camping-kitchen',
      name: 'Camping Kitchen',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 11H5m14 0a7 7 0 01-14 0m14 0v1a6 6 0 01-6 6h-2a6 6 0 01-6-6v-1m4-6V3m4 2V3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'lighting',
      name: 'Lighting',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  return (
    <section
      aria-label="Filter by gear category"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 w-full"
      data-purpose="quick-category-pills"
    >
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 scroll-smooth">
        {categories.map((cat) => {
          const isActive =
            selectedCategory === cat.name ||
            (selectedCategory === '' && cat.name === 'All gear') ||
            (selectedCategory === 'All' && cat.name === 'All gear');

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.name === 'All gear' ? '' : cat.name)}
              className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
                isActive
                  ? 'bg-[#0b121c] text-white shadow-sm hover:bg-slate-800'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
              aria-pressed={isActive}
            >
              <span className={isActive ? 'text-orange-400' : 'text-slate-500'}>
                {cat.icon}
              </span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
