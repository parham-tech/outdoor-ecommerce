import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CheckoutContent } from '@/components/checkout/CheckoutContent';

export const metadata: Metadata = {
  title: 'Checkout | ALTITUDE Outdoors',
  description: 'Complete your simulated order for premium backcountry equipment.',
};

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-slate-500 text-sm">Loading checkout…</div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
