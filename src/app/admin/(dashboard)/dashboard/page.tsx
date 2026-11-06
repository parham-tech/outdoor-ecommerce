import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { RefreshCw, ArrowRight, ShieldCheck, Database, Server } from 'lucide-react';
import { AdminCard } from '@/components/admin/ui/AdminCard';
import { AdminMetricCard } from '@/components/admin/dashboard/AdminMetricCard';
import { RevenueTrendChart } from '@/components/admin/dashboard/RevenueTrendChart';
import { RecentOrdersTable } from '@/components/admin/dashboard/RecentOrdersTable';
import { CriticalInventoryList } from '@/components/admin/dashboard/CriticalInventoryList';
import { QuickActionsPanel } from '@/components/admin/dashboard/QuickActionsPanel';
import {
  MOCK_KPI_METRICS,
  MOCK_REVENUE_TREND,
  MOCK_RECENT_ORDERS,
  MOCK_CRITICAL_INVENTORY,
} from '@/lib/mock/admin-dashboard-data';

export const metadata: Metadata = {
  title: 'Dashboard Overview — ALTITUDE Admin',
  description: 'Operational overview, revenue trends, recent orders, and inventory health',
};

export default function AdminDashboardPage() {
  return (
    <main id="admin-main-content" className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2 select-none">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Store Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
            Monitor real-time simulated sales velocity, fulfill pending orders, and track critical inventory levels.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-850 hover:border-slate-600 text-xs font-semibold text-slate-200 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer"
            title="Simulated Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <span>Refresh Overview</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <section aria-label="Key Performance Indicators" className="space-y-2">
        <h2 className="sr-only">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_KPI_METRICS.map((metric) => (
            <AdminMetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>

      {/* Quick Actions Panel */}
      <section aria-label="Quick Action Shortcuts" className="space-y-2 pt-1">
        <h2 className="sr-only">Quick Actions</h2>
        <QuickActionsPanel />
      </section>

      {/* Main Grid: Revenue Chart, Orders Queue & Inventory Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-1">
        {/* Left Column (2 Cols on lg): Chart & Recent Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue & Volume Chart */}
          <AdminCard
            title="Weekly Revenue & Order Throughput"
            description="Simulated daily gross revenue and completed transaction volume"
            action={
              <span className="text-[11px] font-mono text-slate-500 uppercase bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                Oct 12 – Oct 18, 2026
              </span>
            }
          >
            <RevenueTrendChart data={MOCK_REVENUE_TREND} />
          </AdminCard>

          {/* Recent Orders Queue */}
          <AdminCard
            title="Recent Orders Queue"
            description="Latest customer transactions awaiting fulfillment verification"
            action={
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-1 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors focus-visible:outline-none focus-visible:underline"
              >
                <span>View all orders</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            }
          >
            <RecentOrdersTable orders={MOCK_RECENT_ORDERS} />
          </AdminCard>
        </div>

        {/* Right Column (1 Col on lg): Inventory Watchlist & System Health */}
        <div className="space-y-6">
          {/* Critical Inventory Watchlist */}
          <AdminCard
            title="Stock Exhaustion Alert"
            description="Items with ≤3 units remaining in live stock"
            action={
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                5 Critical
              </span>
            }
          >
            <CriticalInventoryList items={MOCK_CRITICAL_INVENTORY} />
          </AdminCard>

          {/* Platform & System Health Diagnostic Card */}
          <AdminCard
            title="System Diagnostics"
            description="Operational parameters and demonstration runtime state"
          >
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-white">PostgreSQL Store</p>
                    <p className="text-[11px] text-slate-500">Prisma 7 Client Generated</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-mono text-[10px] font-bold">
                  READY
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Server className="w-4 h-4 text-sky-400" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-white">Next.js 16 App Router</p>
                    <p className="text-[11px] text-slate-500">Turbopack &bull; React 19</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-sky-950/80 border border-sky-500/40 text-sky-400 font-mono text-[10px] font-bold">
                  ACTIVE
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-slate-200 block mb-0.5">Frontend Phase Scope:</strong>
                All views operate in frontend mock mode. Real mutations and database queries will be connected in future backend milestones without layout modifications.
              </div>
            </div>
          </AdminCard>
        </div>
      </div>
    </main>
  );
}
