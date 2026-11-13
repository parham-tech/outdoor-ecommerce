import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OrderSuccessContent } from '@/components/checkout/OrderSuccessContent';

export const metadata: Metadata = {
  title: 'Order Confirmed | ALTITUDE Outdoors',
  description: 'Your simulated order has been recorded.',
};

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-slate-500 text-sm">Loading order details…</div>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
