import React from 'react';
import Image from 'next/image';
import { PRICING_CONFIG } from '@/config/pricing';

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  /** Public URL path to the SVG icon */
  iconSrc?: string;
}

export interface FeaturesBarProps {
  /** Optional icon mapping override keyed by feature id */
  icons?: Record<string, React.ReactNode>;
  /** Optional custom feature items list */
  features?: FeatureItem[];
}

export const DEFAULT_FEATURES: FeatureItem[] = [
  {
    id: 'build-for-wild',
    title: 'Build for the Wild',
    description: 'Real gear for real adventure',
    iconSrc: '/images/featured bar svgs/mountain.svg',
  },
  {
    id: 'secure-payment',
    title: 'Secure Payment',
    description: '100% protected',
    iconSrc: '/images/featured bar svgs/secure.svg',
  },
  {
    id: 'support',
    title: '24/7 Support',
    description: "We're here to help",
    iconSrc: '/images/featured bar svgs/support.svg',
  },
  {
    id: 'returns',
    title: 'Easy returns',
    description: '30-days policy',
    iconSrc: '/images/featured bar svgs/turn.svg',
  },
  {
    id: 'shipping',
    title: 'Free shipping',
    description: `On orders of $${PRICING_CONFIG.FREE_SHIPPING_THRESHOLD_CENTS / 100} or more`,
    iconSrc: '/images/featured bar svgs/truck.svg',
  },
];

export function FeaturesBar({ icons = {}, features = DEFAULT_FEATURES }: FeaturesBarProps) {
  return (
    <section
      aria-label="Store Guarantees and Services"
      className="w-full bg-[#F3F3F3] border-b border-black/5 py-8 sm:py-10 lg:py-12"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-6 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-8 items-start">          {features.map((item, index) => {
          const customIcon = icons[item.id];
          // On 2-column mobile, center the 5th item across both columns
          const isBottomRow = index >= 3;
          return (
            <div
              key={item.id}
              className={`flex flex-col items-center text-center ${isBottomRow ? 'col-span-3' : 'col-span-2'
                } md:col-span-1`}
            >
              {/* Icon container */}
              <div
                className="h-9 min-h-[36px] mb-2.5 sm:mb-3 flex items-center justify-center text-[#1C3323]"
                aria-hidden="true"
              >
                {customIcon ?? (
                  item.iconSrc ? (
                    <Image
                      src={item.iconSrc}
                      alt=""
                      width={38}
                      height={38}
                      className=" h-7 sm:h-9 w-auto object-contain select-none pointer-events-none"
                    />
                  ) : null
                )}
              </div>

              <h3 className="text-xs sm:text-base font-bold text-[#1C3323] leading-snug font-sans">
                {item.title}
              </h3>
              <p className="text-[10px] sm:text-sm text-[#2E4D36]/80 mt-1 leading-normal font-sans">
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
