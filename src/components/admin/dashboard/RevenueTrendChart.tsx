'use client';

import React, { useState } from 'react';
import type { AdminRevenueDataPoint } from '@/types/admin';
import { formatCurrency } from '@/lib/utils/format';

export interface RevenueTrendChartProps {
  data: AdminRevenueDataPoint[];
}

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxRevenue = Math.max(...data.map((d) => d.revenueInCents), 1000000);
  const chartHeight = 200;
  const chartWidth = 560;
  const paddingX = 40;
  const paddingY = 25;

  const availableWidth = chartWidth - paddingX * 2;
  const availableHeight = chartHeight - paddingY * 2;
  const barWidth = 32;
  const stepX = availableWidth / (data.length - 1 || 1);

  return (
    <div className="w-full flex flex-col">
      {/* Chart Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-orange-500 inline-block" />
            <span className="text-slate-300 font-medium">Daily Revenue (USD)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-sky-400 inline-block" />
            <span className="text-slate-400">Order Volume</span>
          </div>
        </div>

        {/* Selected / Hovered Value Preview */}
        <div className="text-xs font-mono text-slate-300 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
          {hoveredIndex !== null ? (
            <span>
              <strong className="text-orange-400 font-bold">
                {formatCurrency(data[hoveredIndex].revenueInCents)}
              </strong>{' '}
              ({data[hoveredIndex].orderCount} orders on {data[hoveredIndex].label})
            </span>
          ) : (
            <span className="text-slate-500">Hover bar for daily breakdown</span>
          )}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full aspect-[16/7] min-h-[220px]">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full overflow-visible"
          role="img"
          aria-label="Daily revenue and order volume trend chart for past 7 days"
        >
          <title>Simulated 7-Day Revenue and Orders Trend</title>
          <desc>
            A bar and line chart illustrating simulated gross revenue in cents and daily order
            counts across the week.
          </desc>

          <defs>
            <linearGradient id="revenueBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="revenueBarHoverGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fb923c" stopOpacity="1" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = paddingY + availableHeight * (1 - pct);
            const gridVal = maxRevenue * pct;
            return (
              <g key={idx} className="text-[10px] fill-slate-500 font-mono select-none">
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="0.75"
                  strokeDasharray={pct === 0 ? undefined : '3 3'}
                  opacity={pct === 0 ? '0.7' : '0.4'}
                />
                <text x={paddingX - 6} y={y + 3} textAnchor="end">
                  {formatCurrency(gridVal).split('.')[0]}
                </text>
              </g>
            );
          })}

          {/* Revenue Bars */}
          {data.map((point, index) => {
            const x = paddingX + index * stepX;
            const barHeight = (point.revenueInCents / maxRevenue) * availableHeight;
            const y = paddingY + availableHeight - barHeight;
            const isHovered = hoveredIndex === index;

            return (
              <g
                key={point.date}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Bar */}
                <rect
                  x={x - barWidth / 2}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="5"
                  fill={isHovered ? 'url(#revenueBarHoverGrad)' : 'url(#revenueBarGrad)'}
                  stroke={isHovered ? '#fdba74' : '#f97316'}
                  strokeWidth={isHovered ? '1.5' : '0.5'}
                  className="transition-all duration-150"
                />

                {/* X-axis Label */}
                <text
                  x={x}
                  y={chartHeight - 6}
                  textAnchor="middle"
                  className={`text-[11px] font-sans font-semibold select-none ${
                    isHovered ? 'fill-orange-400' : 'fill-slate-400'
                  }`}
                >
                  {point.label}
                </text>

                {/* Order count badge pill above bar */}
                <circle
                  cx={x}
                  cy={y - 8}
                  r={isHovered ? '4.5' : '3'}
                  fill="#38bdf8"
                  className="transition-all duration-150"
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-2 text-center text-[10px] font-mono text-slate-500 uppercase">
        Native SVG Chart &bull; Zero External Dependencies &bull; Simulated Metrics
      </div>
    </div>
  );
}
