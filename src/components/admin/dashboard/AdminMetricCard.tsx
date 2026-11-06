import React from 'react';
import { ArrowUpRight, ArrowDownRight, DollarSign, ShoppingCart, AlertTriangle, Users } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { AdminKPIMetric } from '@/types/admin';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'kpi-revenue': DollarSign,
  'kpi-orders': ShoppingCart,
  'kpi-inventory': AlertTriangle,
  'kpi-customers': Users,
};

export function AdminMetricCard({ metric }: { metric: AdminKPIMetric }) {
  const IconComponent = ICON_MAP[metric.id] || DollarSign;
  const isPositive = metric.trend === 'up';
  const isWarningMetric = metric.id === 'kpi-inventory';

  return (
    <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-5 shadow-sm text-slate-100 flex flex-col justify-between hover:border-slate-700/80 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            {metric.label}
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 block tracking-tight">
            {metric.value}
          </span>
        </div>

        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border select-none',
            isWarningMetric
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
          )}
        >
          <IconComponent className="w-5 h-5" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/70 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 font-semibold">
          {isPositive ? (
            <span className="inline-flex items-center text-emerald-400 gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              +{metric.changePercentage}%
            </span>
          ) : (
            <span
              className={cn(
                'inline-flex items-center gap-0.5',
                isWarningMetric ? 'text-emerald-400' : 'text-red-400'
              )}
            >
              <ArrowDownRight className="w-3.5 h-3.5" aria-hidden="true" />
              {metric.changePercentage}%
            </span>
          )}
          <span className="text-slate-500 font-normal ml-1 truncate">{metric.timeframe}</span>
        </div>

        {/* Demo Indicator */}
        <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
          Mock Metric
        </span>
      </div>
    </div>
  );
}
