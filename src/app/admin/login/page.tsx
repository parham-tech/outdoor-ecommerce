import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { AdminLoginForm } from '@/components/admin/auth/AdminLoginForm';

export const metadata: Metadata = {
  title: 'Admin Login — ALTITUDE',
  description: 'Sign in to access the ALTITUDE Admin Console',
};

export default function AdminLoginPage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 selection:bg-orange-500 selection:text-white">
      {/* Top Utility Header */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-md p-1"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Return to Storefront</span>
        </Link>
        <span className="text-[11px] font-mono tracking-widest text-slate-500 uppercase">
          SECURE CONSOLE v1.0
        </span>
      </header>

      {/* Main Center Login Canvas */}
      <main id="admin-login-main" className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 my-auto">
        {/* Brand Banner */}
        <div className="flex flex-col items-center mb-6 sm:mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg p-1.5"
            aria-label="ALTITUDE Home"
          >
            <Image
              src="/images/altitude-logo.png"
              alt=""
              width={40}
              height={44}
              className="h-10 w-auto object-contain select-none transition-transform duration-200 group-hover:scale-105"
              priority
            />
            <span className="text-2xl sm:text-3xl font-black tracking-wider text-white uppercase font-sans">
              ALTITUDE
            </span>
          </Link>
          <span className="mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-orange-500/10 text-orange-400 border border-orange-500/20">
            Operations Portal
          </span>
        </div>

        {/* Client-Side Login Form */}
        <AdminLoginForm />
      </main>

      {/* Footer Utility Bar */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 text-center text-xs text-slate-500 border-t border-slate-900">
        &copy; 2026 ALTITUDE Technical Outdoor Equipment. All rights reserved.
      </footer>
    </div>
  );
}
