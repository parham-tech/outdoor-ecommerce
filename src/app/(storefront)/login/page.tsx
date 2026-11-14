import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CustomerLoginForm } from '@/components/auth/CustomerLoginForm';

export const metadata: Metadata = {
  title: 'Sign In | ALTITUDE Outdoors',
  description: 'Sign in to your ALTITUDE customer account to track orders, manage wishlist gear, and access member benefits.',
};

function LoginFallback() {
  return (
    <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200/90 p-8 shadow-xs animate-pulse">
      <div className="h-6 bg-stone-200 rounded w-1/2 mb-4 mx-auto" />
      <div className="h-4 bg-stone-100 rounded w-3/4 mb-6 mx-auto" />
      <div className="space-y-4">
        <div className="h-10 bg-stone-100 rounded-xl" />
        <div className="h-10 bg-stone-100 rounded-xl" />
        <div className="h-11 bg-stone-200 rounded-xl" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="bg-[#F7F5F0] min-h-[calc(100vh-140px)] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <Suspense fallback={<LoginFallback />}>
        <CustomerLoginForm />
      </Suspense>
    </div>
  );
}

