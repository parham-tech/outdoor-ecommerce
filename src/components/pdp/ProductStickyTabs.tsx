'use client';

import React, { useState, useEffect } from 'react';

export interface ProductStickyTabsProps {
  reviewCount?: number | null;
}

export function ProductStickyTabs({ reviewCount }: ProductStickyTabsProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'features' | 'specifications' | 'reviews'>('description');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['description', 'features', 'specifications', 'reviews'] as const;
      const scrollPos = window.scrollY + 180;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveTab(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>, id: typeof activeTab) => {
    e.preventDefault();
    setActiveTab(id);
    const target = document.getElementById(id);
    if (target) {
      const topOffset = target.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  return (
    <div
      className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-16 sm:top-20 z-30 shadow-2xs transition-all"
      data-purpose="pdp-sticky-tabs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav aria-label="Product detail sections" className="flex space-x-6 sm:space-x-8 text-xs sm:text-sm font-semibold overflow-x-auto no-scrollbar py-0.5">
          <a
            href="#description"
            onClick={(e) => handleTabClick(e, 'description')}
            className={`py-3.5 border-b-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 ${
              activeTab === 'description'
                ? 'text-[#e86c1e] border-[#e86c1e] font-bold'
                : 'text-slate-500 border-transparent hover:text-slate-900'
            }`}
          >
            Description
          </a>

          <a
            href="#features"
            onClick={(e) => handleTabClick(e, 'features')}
            className={`py-3.5 border-b-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 ${
              activeTab === 'features'
                ? 'text-[#e86c1e] border-[#e86c1e] font-bold'
                : 'text-slate-500 border-transparent hover:text-slate-900'
            }`}
          >
            Features
          </a>

          <a
            href="#specifications"
            onClick={(e) => handleTabClick(e, 'specifications')}
            className={`py-3.5 border-b-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 ${
              activeTab === 'specifications'
                ? 'text-[#e86c1e] border-[#e86c1e] font-bold'
                : 'text-slate-500 border-transparent hover:text-slate-900'
            }`}
          >
            Specifications
          </a>

          <a
            href="#reviews"
            onClick={(e) => handleTabClick(e, 'reviews')}
            className={`py-3.5 border-b-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 ${
              activeTab === 'reviews'
                ? 'text-[#e86c1e] border-[#e86c1e] font-bold'
                : 'text-slate-500 border-transparent hover:text-slate-900'
            }`}
          >
            Reviews {typeof reviewCount === 'number' ? `(${reviewCount})` : ''}
          </a>
        </nav>
      </div>
    </div>
  );
}
