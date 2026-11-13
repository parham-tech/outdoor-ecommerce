'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, ArrowRight, Loader2, LogIn } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

export function AccountAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, isHydrated } = useCustomerAuth();

  if (!isHydrated) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin mb-3" aria-hidden="true" />
        <p className="text-sm text-stone-500 font-medium">Loading customer account...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    const loginHref = `/login?redirect=${encodeURIComponent(pathname)}`;
    const registerHref = `/register?redirect=${encodeURIComponent(pathname)}`;

    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200/90 p-8 text-center shadow-xs">
          <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-4 border border-orange-100">
            <ShieldAlert className="w-7 h-7" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-stone-900 mb-2 font-serif">Sign In Required</h1>
          <p className="text-sm text-stone-600 mb-6 leading-relaxed">
            Please sign in to access your simulated customer dashboard, track your orders, and manage your account profile.
          </p>
          <div className="space-y-3">
            <Link
              href={loginHref}
              className="w-full inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              <span>Sign In to Account</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href={registerHref}
              className="w-full inline-flex items-center justify-center gap-2 border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold py-2.5 px-6 rounded-xl transition-colors text-sm"
            >
              <span>Create an Account</span>
            </Link>
          </div>
          <p className="text-xs text-stone-400 mt-5">
            Prototype demo mode: Any valid email can be used to simulate sign-in.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
