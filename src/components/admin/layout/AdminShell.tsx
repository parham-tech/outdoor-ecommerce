'use client';

import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { ADMIN_DEMO_DISCLAIMER } from '@/lib/mock/admin-dashboard-data';
import { AlertTriangle } from 'lucide-react';

export interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans selection:bg-orange-500 selection:text-white">
      {/* Sidebar Navigation */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <AdminHeader onMenuToggle={() => setIsSidebarOpen(true)} />

        {/* Global Prototype Disclaimer Banner */}
        <div className="bg-amber-950/40 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-300/90 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
            <p className="text-[11px] leading-relaxed">
              <strong className="font-semibold text-amber-200">Simulation Notice: </strong>
              {ADMIN_DEMO_DISCLAIMER}
            </p>
          </div>
        </div>

        {/* Dynamic Route Content */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>

        {/* Admin Footer */}
        <footer className="w-full border-t border-slate-900 px-6 py-4 text-center text-xs text-slate-500 bg-slate-950/80">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>&copy; 2026 ALTITUDE Technical Outdoors &bull; Admin Console</span>
            <span className="font-mono text-[10px] text-slate-600">
              SIMULATED FRONTEND DEMO &bull; CLIENT-SIDE ONLY
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
