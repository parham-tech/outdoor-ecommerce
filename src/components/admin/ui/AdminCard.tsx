import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface AdminCardProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function AdminCard({
  title,
  description,
  action,
  children,
  footer,
  className,
  bodyClassName,
}: AdminCardProps) {
  const hasHeader = Boolean(title || description || action);

  return (
    <div
      className={cn(
        'bg-slate-900 border border-slate-800/90 rounded-2xl shadow-sm text-slate-100 flex flex-col',
        className
      )}
    >
      {hasHeader && (
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-800/80 flex items-start justify-between gap-4">
          <div>
            {title && (
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className={cn('p-5 sm:p-6 flex-1', bodyClassName)}>{children}</div>

      {footer && (
        <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-800/80 bg-slate-950/40 rounded-b-2xl text-xs text-slate-400">
          {footer}
        </div>
      )}
    </div>
  );
}
