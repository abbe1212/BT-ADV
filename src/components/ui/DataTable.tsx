'use client';

import React, { ReactNode } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Column<T> {
  /** Unique column key (also used as the React key) */
  key: string;
  /** Header label */
  header: ReactNode;
  /** How to render the cell for a given row */
  render: (row: T) => ReactNode;
  /** Optional: additional className for the <th> and <td> */
  className?: string;
  /** When true, the column header is right-aligned */
  alignRight?: boolean;
}

export interface DataTableProps<T> {
  /** Column definitions */
  columns: Column<T>[];
  /** Data rows */
  data: T[];
  /** A function that returns a stable unique key for each row */
  rowKey: (row: T) => string;
  /**
   * When true, the table shows a skeleton loading state.
   * The number of skeleton rows matches `skeletonRowCount`.
   */
  isLoading?: boolean;
  /** How many skeleton rows to render while loading (default: 5) */
  skeletonRowCount?: number;
  /** Rendered when data is empty and not loading */
  emptyState?: ReactNode;
  /**
   * Optional: a callback fired when a row is clicked.
   * Enables hover highlight on rows when provided.
   */
  onRowClick?: (row: T) => void;
  /** Optional: called to determine whether a row should be highlighted */
  isRowSelected?: (row: T) => boolean;
  /** Optional: extra className applied to the <table> element */
  tableClassName?: string;
}

// ─── Skeleton Row ───────────────────────────────────────────────────────────────

function SkeletonRow({ colCount }: { colCount: number }) {
  return (
    <tr>
      {Array.from({ length: colCount }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-[#14304A] rounded animate-pulse" style={{ width: i === 0 ? '60%' : i === colCount - 1 ? '40%' : '75%' }} />
        </td>
      ))}
    </tr>
  );
}

// ─── DataTable ────────────────────────────────────────────────────────────────

/**
 * Generic, reusable data table primitive for admin pages.
 *
 * Features:
 * - Skeleton loading state (via `isLoading` prop).
 * - Empty state slot (`emptyState` prop).
 * - Row selection highlight (`isRowSelected`, `onRowClick`).
 * - Fully typed column definitions with `render` callbacks.
 *
 * Usage:
 * ```tsx
 * <DataTable
 *   columns={[
 *     { key: 'name', header: 'Name', render: row => row.name },
 *     { key: 'status', header: 'Status', render: row => <Badge status={row.status} /> },
 *   ]}
 *   data={bookings}
 *   rowKey={row => row.id}
 *   isLoading={isFetching}
 *   emptyState={<EmptyState title="No records" />}
 * />
 * ```
 */
export function DataTable<T>({
  columns,
  data,
  rowKey,
  isLoading = false,
  skeletonRowCount = 5,
  emptyState,
  onRowClick,
  isRowSelected,
  tableClassName = '',
}: DataTableProps<T>) {
  const showEmpty = !isLoading && data.length === 0 && emptyState;

  return (
    <div className="overflow-x-auto w-full">
      <table className={`w-full text-sm text-left ${tableClassName}`}>
        {/* ── Header ───────────────────────────────────────────────────── */}
        <thead className="text-[11px] text-white/50 uppercase tracking-wider bg-[#061520] border-b border-[#14304A]">
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                className={`px-4 py-3 font-medium ${col.alignRight ? 'text-right' : ''} ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* ── Body ─────────────────────────────────────────────────────── */}
        <tbody className="divide-y divide-[#14304A]">
          {isLoading ? (
            /* Loading skeleton */
            Array.from({ length: skeletonRowCount }).map((_, i) => (
              <SkeletonRow key={i} colCount={columns.length} />
            ))
          ) : showEmpty ? (
            /* Empty state */
            <tr>
              <td colSpan={columns.length} className="py-16 text-center px-4">
                {emptyState}
              </td>
            </tr>
          ) : (
            /* Data rows */
            data.map(row => {
              const key = rowKey(row);
              const selected = isRowSelected?.(row) ?? false;
              const clickable = !!onRowClick;

              return (
                <tr
                  key={key}
                  onClick={clickable ? () => onRowClick(row) : undefined}
                  className={`
                    transition-colors group
                    ${selected  ? 'bg-[#FFEE34]/5'          : ''}
                    ${clickable ? 'cursor-pointer hover:bg-[#0d2538]' : ''}
                  `}
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 ${col.alignRight ? 'text-right' : ''} ${col.className ?? ''}`}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
