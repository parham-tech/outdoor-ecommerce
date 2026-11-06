import React from 'react';
import { cn } from '@/lib/utils/cn';
import type { AdminTableColumn } from '@/types/admin';

export interface AdminTableProps<T> {
  columns: AdminTableColumn<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  caption?: string;
  emptyMessage?: string;
  className?: string;
}

export function AdminTable<T>({
  columns,
  data,
  keyExtractor,
  caption,
  emptyMessage = 'No records found.',
  className,
}: AdminTableProps<T>) {
  return (
    <div className={cn('w-full overflow-x-auto rounded-xl border border-slate-800/90', className)}>
      <table className="w-full text-left text-sm text-slate-200 border-collapse">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold select-none">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                scope="col"
                className={cn('px-4 py-3.5 sm:px-5', col.headerClassName)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 bg-slate-900/60 font-sans">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-5 py-8 text-center text-sm text-slate-400 italic"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, rowIdx) => (
              <tr
                key={keyExtractor(item, rowIdx)}
                className="transition-colors hover:bg-slate-800/50"
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={cn(
                      'px-4 py-3.5 sm:px-5 text-slate-200 align-middle',
                      col.className
                    )}
                  >
                    {col.render
                      ? col.render(item)
                      : col.accessorKey
                      ? String(item[col.accessorKey] ?? '')
                      : null}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
