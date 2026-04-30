import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
}

export function PaginationControls({
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
}: PaginationControlsProps) {
  if (totalCount === 0) return null;

  const totalPages = Math.ceil(totalCount / pageSize);
  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalCount);

  // Build page number array: always show first, last, and up to 3 around current
  const getPages = (): (number | 'ellipsis')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [1];
    if (currentPage > 3) pages.push('ellipsis');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('ellipsis');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="px-4 py-3 border-t border-border-input bg-surface-deep flex items-center justify-between gap-4 flex-wrap text-sm">
      {/* Entry count */}
      <span className="text-white/50">
        Showing <span className="text-white font-bold">{from}</span> – <span className="text-white font-bold">{to}</span> of{' '}
        <span className="text-white font-bold">{totalCount.toLocaleString()}</span> bookings
      </span>

      {/* Page controls */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded border border-border-input text-white/50 hover:text-white hover:border-yellow transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        {getPages().map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-white/30 text-xs">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`w-8 h-8 flex items-center justify-center rounded text-sm font-bold transition-colors ${
                p === currentPage
                  ? 'bg-yellow text-navy'
                  : 'border border-border-input text-white/50 hover:text-white hover:border-yellow'
              }`}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="w-8 h-8 flex items-center justify-center rounded border border-border-input text-white/50 hover:text-white hover:border-yellow transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
