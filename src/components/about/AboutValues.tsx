import React from 'react';

export interface BrandPrinciple {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const BRAND_PRINCIPLES: BrandPrinciple[] = [
  {
    id: 'simplicity',
    title: 'Functional Simplicity',
    description:
      'Stripping away unnecessary bulk and complicated gimmicks so you can focus purely on the trail ahead.',
    icon: (
      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 21a9 9 0 100-18 9 9 0 000 18zM14.5 9.5L9.5 14.5m0-5l5 5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    ),
  },
  {
    id: 'intuitive',
    title: 'Intuitive Camp Design',
    description:
      'Color-coded attachments, accessible gear pockets, and ergonomic shapes that make camp setups natural in fading light.',
    icon: (
      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M3 21l9-18 9 18H3zM12 3v18"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    ),
  },
  {
    id: 'respect',
    title: 'Respect for the Wild',
    description:
      'Designing equipment intended to be cared for, packed out, and enjoyed in harmony with the natural environment.',
    icon: (
      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <path
          d="M3 20l7-14 4 8 3-5 4 11H3z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    ),
  },
  {
    id: 'adventure',
    title: 'Accessible Adventure',
    description:
      'Inspiring confidence whether you are pitching your first weekend tent or heading out on a multi-day alpine trek.',
    icon: (
      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    ),
  },
];

export function AboutValues() {
  return (
    <section
      aria-labelledby="about-values-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full"
      data-purpose="about-values"
    >
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <p className="text-xs font-bold uppercase tracking-widest text-[#f97316] mb-2">
          OUR PRINCIPLES
        </p>
        <h2
          id="about-values-heading"
          className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1C3323] tracking-tight font-sans"
        >
          What guides our design.
        </h2>
      </div>

      {/* 4-Item Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {BRAND_PRINCIPLES.map((principle) => (
          <article
            key={principle.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
          >
            <div>
              {/* Icon Container */}
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-4">
                {principle.icon}
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-slate-900 tracking-tight mb-2">
                {principle.title}
              </h3>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {principle.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
