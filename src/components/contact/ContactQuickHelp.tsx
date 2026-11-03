import React from 'react';
import Link from 'next/link';

interface HelpCard {
  title: string;
  description: string;
  linkLabel: string;
  href: string;
  tag: string;
}

const QUICK_HELP_CARDS: HelpCard[] = [
  {
    tag: 'CATALOG',
    title: 'Explore All Gear',
    description:
      'Search our complete collection of backcountry tents, multi-day backpacks, camp cooking gear, and outdoor lighting.',
    linkLabel: 'View Shop Catalog',
    href: '/shop',
  },
  {
    tag: 'SPECIFICATIONS',
    title: 'Alpha 2P Tent Specifications',
    description:
      'Inspect comprehensive materials, dimensions, packed weight (2.4 kg), and weather ratings for our flagship shelter.',
    linkLabel: 'Read Tent Specs',
    href: '/products/alpha-2-person-tent',
  },
  {
    tag: 'ABOUT US',
    title: 'Design Philosophy & Story',
    description:
      'Learn about ALTITUDE’s approach to purpose-built equipment, design standards, and our focus on backcountry essentials.',
    linkLabel: 'Discover Our Story',
    href: '/about',
  },
];

export function ContactQuickHelp() {
  return (
    <section
      aria-labelledby="quick-help-heading"
      className="bg-[#f8fafc] border-t border-slate-200/90 py-12 sm:py-16 mt-8 sm:mt-12"
      data-purpose="contact-quick-help"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 select-none">
            Self-Service Resources
          </span>
          <h2
            id="quick-help-heading"
            className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-1"
          >
            Looking For Immediate Answers?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Browse our verified equipment catalog, inspect in-depth product specifications, or learn more about the ALTITUDE philosophy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {QUICK_HELP_CARDS.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all duration-150 group"
            >
              <div>
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase select-none">
                  {card.tag}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1 group-hover:text-orange-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-500 mt-2 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100">
                <Link
                  href={card.href}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-orange-600 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500 rounded-sm"
                >
                  <span>{card.linkLabel}</span>
                  <span
                    className="group-hover:translate-x-1 transition-transform"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
