import React from 'react';

export function ShopNotificationBar({
  text = 'Free shipping on orders over $150 \u00A0\u00B7\u00A0 30-day easy returns',
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
