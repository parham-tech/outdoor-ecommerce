import React from 'react';
import Image from 'next/image';

const VERIFIED_SOCIAL_LINKS = [
  {
    name: 'Instagram',
    href: 'https://instagram.com',
    iconSrc: '/images/footer/instagram.png',
    description: 'Visual stories & community updates',
  },
  {
    name: 'Telegram',
    href: 'https://t.me',
    iconSrc: '/images/footer/telegram.png',
    description: 'Community channel & announcements',
  },
  {
    name: 'Facebook',
    href: 'https://facebook.com',
    iconSrc: '/images/footer/facebook.png',
    description: 'Community group & events',
  },
] as const;

export function ContactInfoCard() {
  return (
    <aside
      aria-label="ALTITUDE Contact Channels & Information"
      className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col justify-between h-full space-y-6"
    >
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
          Reach Out
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
          Brand Channels & Inquiries
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
          Whether you have questions about equipment specifications, tent setups, or weight optimization for your backcountry trips, our digital channels are open.
        </p>

        {/* Verified Social Channels */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
            Verified Digital Channels
          </h3>
          <ul className="space-y-3">
            {VERIFIED_SOCIAL_LINKS.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200/80 hover:border-orange-500/50 hover:bg-orange-50/20 transition-all duration-150 group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center p-1.5 flex-shrink-0 group-hover:bg-white group-hover:shadow-xs transition-colors">
                    <Image
                      src={link.iconSrc}
                      alt=""
                      width={20}
                      height={20}
                      className="w-4 h-4 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-orange-600 transition-colors flex items-center gap-1">
                      {link.name}
                      <span className="sr-only">(opens in new tab)</span>
                      <svg
                        className="w-3 h-3 text-slate-400 group-hover:text-orange-500 transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </span>
                    <p className="text-[11px] text-slate-500 truncate">
                      {link.description}
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Transparent Demonstration Context */}
      <div className="pt-4 border-t border-slate-100 bg-slate-50/70 rounded-xl p-4">
        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <svg
            className="w-4 h-4 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Demonstration Project
        </h3>
        <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
          ALTITUDE is an interactive outdoor e-commerce showcase. Direct telephone lines, physical retail locations, and live customer service dispatchers are not currently established.
        </p>
      </div>
    </aside>
  );
}
