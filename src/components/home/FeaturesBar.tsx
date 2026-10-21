import React from 'react';

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  /** Whether this item displays an icon slot (items 2-5 have icons in Figma; item 1 is text-only) */
  hasIcon?: boolean;
}

export interface FeaturesBarProps {
  /** Optional icon mapping keyed by feature id (e.g. 'secure-payment', 'support', 'returns', 'shipping') */
  icons?: Record<string, React.ReactNode>;
}

const DEFAULT_FEATURES: FeatureItem[] = [
  {
    id: 'build-for-wild',
    title: 'Build for the Wild',
    description: 'Real gear for real adventure',
    hasIcon: false,
  },
  {
    id: 'secure-payment',
    title: 'Secure Payment',
    description: '100% protected',
    hasIcon: true,
  },
  {
    id: 'support',
    title: '24/7 Support',
    description: "We're here to help",
    hasIcon: true,
  },
  {
    id: 'returns',
    title: 'Easy returns',
    description: '30-days policy',
    hasIcon: true,
  },
  {
    id: 'shipping',
    title: 'Free shipping',
    description: 'On orders over 150$',
    hasIcon: true,
  },
];

export function FeaturesBar({ icons = {} }: FeaturesBarProps) {
  return (
    <section
      aria-label="Store Guarantees and Services"
      className="w-full bg-[#F3F3F3] border-b border-black/5 py-8 sm:py-10"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 items-start">
          {DEFAULT_FEATURES.map((item, index) => {
            const iconNode = icons[item.id];
            // On 2-column mobile, center the 5th item across both columns
            const isLastOnMobile = index === DEFAULT_FEATURES.length - 1;

            return (
              <div
                key={item.id}
                className={`flex flex-col items-center text-center ${
                  isLastOnMobile ? 'col-span-2 md:col-span-1' : ''
                }`}
              >
                {/* Icon container: reserved for items with icons to prevent layout shift */}
                {item.hasIcon ? (
                  <div
                    className="h-7 w-7 mb-2 flex items-center justify-center text-[#1C3323]"
                    aria-hidden="true"
                  >
                    {iconNode ?? null}
                  </div>
                ) : (
                  // Spacer matching the icon height to keep baseline alignment with adjacent columns
                  <div className="h-7 mb-2" aria-hidden="true" />
                )}

                <h3 className="text-sm sm:text-base font-bold text-[#1C3323] leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#2E4D36]/80 mt-1 leading-normal">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
