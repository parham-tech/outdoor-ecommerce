import React from 'react';
import { PRICING_CONFIG } from '@/config/pricing';

const DEFAULT_NOTIFICATION_TEXT = `Free shipping on orders of $${PRICING_CONFIG.FREE_SHIPPING_THRESHOLD_CENTS / 100} or more \u00A0\u00B7\u00A0 30-day easy returns`;

export function ShopNotificationBar({
  text = DEFAULT_NOTIFICATION_TEXT,
}: {
  text?: string;
}) {
  return (
    <div
      role="region"
      aria-label="Promotional Announcement"
      className="w-full bg-[#f8fafc] border-b border-slate-200 py-2 text-center text-xs sm:text-[13px] text-slate-600 font-medium tracking-wide select-none"
      data-purpose="notification-bar"
    >
      {text}
    </div>
  );
}
