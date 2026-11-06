'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, ExternalLink, ShieldAlert, User, Bell } from 'lucide-react';
import { AdminBreadcrumb } from '@/components/admin/ui/AdminBreadcrumb';
import type { AdminBreadcrumbItem } from '@/types/admin';

export interface AdminHeaderProps {
  onMenuToggle: () => void;
  breadcrumbs?: AdminBreadcrumbItem[];
}

export function AdminHeader({ onMenuToggle, breadcrumbs = [] }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-10 w-full h-16 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Left Cluster: Mobile Menu Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="truncate">
          <AdminBreadcrumb items={breadcrumbs} />
        </div>
      </div>

      {/* Right Cluster: Prototype Banner, Storefront Link, Operator Profile */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Prototype Demo Warning Pill */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-mono font-semibold uppercase tracking-wider select-none">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
          <span>Demo Mock Mode</span>
        </div>

        {/* Storefront Link Icon Button */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          title="Open Storefront in new tab"
          aria-label="Open Storefront in new tab"
        >
          <ExternalLink className="w-4 h-4" aria-hidden="true" />
        </Link>

        {/* Notifications Icon Button */}
        <button
          type="button"
          className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          title="Operational notifications (5 active alerts)"
          aria-label="Notifications: 5 active stock alerts"
        >
          <Bell className="w-4 h-4" aria-hidden="true" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-slate-950" />
        </button>

        {/* Operator Profile Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800/80">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300 font-bold text-xs select-none">
            <User className="w-4 h-4 text-orange-400" aria-hidden="true" />
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-white leading-tight">
              Admin Operator
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-medium">
              ADMIN ROLE
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
