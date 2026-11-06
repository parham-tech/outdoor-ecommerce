'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Users,
  FolderTree,
  Settings,
  ExternalLink,
  LogOut,
  X,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Catalog & Stock',
    items: [
      { label: 'Products', href: '/admin/products', icon: Package },
      { label: 'Inventory', href: '/admin/inventory', icon: Boxes, badge: '5 alerts' },
      { label: 'Categories', href: '/admin/categories', icon: FolderTree },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Orders', href: '/admin/orders', icon: ShoppingCart, badge: 'New' },
      { label: 'Customers', href: '/admin/customers', icon: Users },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

export interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between shrink-0">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded p-1"
          aria-label="ALTITUDE Admin Dashboard"
        >
          <Image
            src="/images/altitude-logo.png"
            alt=""
            width={28}
            height={32}
            className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
            priority
          />
          <div className="flex flex-col">
            <span className="text-base font-black tracking-wider text-white uppercase font-sans">
              ALTITUDE
            </span>
            <span className="text-[10px] font-mono tracking-widest text-orange-400 uppercase font-semibold">
              ADMIN CONSOLE
            </span>
          </div>
        </Link>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation drawer"
          className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Navigation Links Scroll Container */}
      <nav
        aria-label="Admin Navigation"
        className="flex-1 px-3.5 py-4 space-y-6 overflow-y-auto"
      >
        {NAV_SECTIONS.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <h3 className="px-3 text-[11px] font-mono tracking-wider text-slate-500 uppercase font-bold select-none">
              {section.title}
            </h3>
            <ul className="space-y-0.5 mt-1.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
                const IconComponent = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
                        isActive
                          ? 'bg-orange-500/15 text-orange-400 font-semibold border border-orange-500/30'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border border-transparent'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent
                          className={cn(
                            'w-4 h-4 transition-colors shrink-0',
                            isActive
                              ? 'text-orange-400'
                              : 'text-slate-500 group-hover:text-slate-300'
                          )}
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={cn(
                            'text-[10px] font-bold px-1.5 py-0.5 rounded-full select-none',
                            item.badge.includes('alerts')
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom Utilities */}
      <div className="p-3.5 border-t border-slate-800/80 space-y-1 bg-slate-950/80 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <ExternalLink className="w-4 h-4 text-slate-500" aria-hidden="true" />
          <span>View Public Storefront</span>
        </Link>

        <Link
          href="/admin/login"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <LogOut className="w-4 h-4 text-red-400" aria-hidden="true" />
          <span>Sign Out of Console</span>
        </Link>

        {/* Demo status footnote */}
        <div className="pt-2 px-3">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase">
            <ShieldCheck className="w-3 h-3 text-emerald-500" aria-hidden="true" />
            <span>OPERATOR CONSOLE v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-slate-800/90 h-screen sticky top-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Overlay Drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Drawer"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Canvas */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
