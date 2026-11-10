import React from 'react';
import Image from 'next/image';
import { PRICING_CONFIG } from '@/config/pricing';

export interface TrustItem {
  id: string;
  title: string;
  description: string;
  iconSrc: string;
}

const DEFAULT_TRUST_ITEMS: TrustItem[] = [
  {
    id: 'wild',
    title: 'Built for the wild',
    description: 'Real gear for real adventure',
    iconSrc: '/images/featured bar svgs/mountain.svg',
  },
  {
    id: 'payment',
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
    description: '30-day policy',
    iconSrc: '/images/featured bar svgs/turn.svg',
  },
  {
    id: 'shipping',
    title: 'Free shipping',
    description: `On orders of $${PRICING_CONFIG.FREE_SHIPPING_THRESHOLD_CENTS / 100} or more`,
    iconSrc: '/images/featured bar svgs/truck.svg',
  },
];

export function ShopTrustBar({ items = DEFAULT_TRUST_ITEMS }: { items?: TrustItem[] }) {
  return (
    <section
      aria-label="Store Guarantees and Services"
      className="w-full bg-[#f8fafc] border-t border-b border-slate-200 py-8 mt-12"
      data-purpose="trust-badges"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-left">
          {items.map((item, idx) => {
            // Center the 5th item on mobile grid-cols-2 if odd count
            const isLastOdd = idx === items.length - 1 && items.length % 2 !== 0;
            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 ${
                  isLastOdd ? 'col-span-2 md:col-span-1 justify-center md:justify-start' : ''
                }`}
              >
                <div className="text-slate-800 flex-shrink-0 w-8 h-8 flex items-center justify-center">
                  <Image
                    src={item.iconSrc}
                    alt=""
                    width={28}
                    height={28}
                    className="w-6 h-6 object-contain select-none pointer-events-none"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
