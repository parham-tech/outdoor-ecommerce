'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  User,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

interface AccountNavProps {
  title?: string;
  subtitle?: string;
}

export function AccountNav({ title, subtitle }: AccountNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { customer, logout } = useCustomerAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    {
      label: 'Dashboard',
      href: '/account',
      icon: LayoutDashboard,
      isActive: pathname === '/account',
    },
    {
      label: 'Orders',
      href: '/account/orders',
      icon: Package,
      isActive: pathname.startsWith('/account/orders'),
    },
    {
      label: 'Profile',
      href: '/account/profile',
      icon: User,
      isActive: pathname === '/account/profile',
    },
  ];

  return (
    <div className="mb-8">
      {/* Account Header Banner */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2 border border-emerald-100">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              <span>Simulated Member Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              {title || `Welcome back, ${customer?.fullName || 'Hiker'}`}
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              {subtitle || 'Manage your expedition orders, gear profile, and backcountry settings.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-stone-500 hidden md:inline">
              Signed in as <strong className="text-stone-800">{customer?.email}</strong>
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-600 hover:text-red-700 hover:bg-red-50 border border-stone-200 hover:border-red-200 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer"
              title="Sign out of simulated session"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Account Section Tabs Navigation */}
      <nav aria-label="Account Sections" className="flex border-b border-stone-200 gap-2 sm:gap-6 overflow-x-auto pb-px">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex items-center gap-2 py-3 px-3 sm:px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-t-lg ${
                item.isActive
                  ? 'border-orange-600 text-orange-600 font-bold bg-orange-50/40'
                  : 'border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-300'
              }`}
              aria-current={item.isActive ? 'page' : undefined}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
