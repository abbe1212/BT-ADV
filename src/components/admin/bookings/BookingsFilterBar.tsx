'use client';

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface BookingsFilterBarProps {
  search: string;
  status: string;
  type: string;
  dateFrom: string;
  dateTo: string;
  onFilterChange: (key: string, value: string) => void;
}

export function BookingsFilterBar({
  search,
  status,
  type,
  dateFrom,
  dateTo,
  onFilterChange,
}: BookingsFilterBarProps) {
  // Local controlled state for the search input so it feels instant
  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, 400);

  // When the debounced value changes, push to the URL (triggers server re-fetch)
  useEffect(() => {
    if (debouncedSearch !== search) {
      onFilterChange('search', debouncedSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Keep local state in sync if parent resets it (e.g. "Clear Filters")
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const hasActiveFilters = search || status || type || dateFrom || dateTo;

  const clearAll = () => {
    setLocalSearch('');
    onFilterChange('search', '');
    onFilterChange('status', '');
    onFilterChange('type', '');
    onFilterChange('dateFrom', '');
    onFilterChange('dateTo', '');
  };

  return (
    <div className="bg-surface p-4 rounded-xl border border-border-input space-y-3">
      {/* Row 1: Search + Status + Type */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px] max-w-xs group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-yellow transition-colors" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search name, email, ref…"
            className="w-full bg-surface-deep text-sm text-white border border-border-input rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-yellow focus:ring-1 focus:ring-yellow transition-all"
          />
          {localSearch && (
            <button
              onClick={() => { setLocalSearch(''); onFilterChange('search', ''); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status filter */}
        <select
          value={status}
          onChange={(e) => onFilterChange('status', e.target.value)}
          className="bg-surface-deep text-sm text-white/80 border border-border-input rounded-lg px-3 py-2 focus:outline-none focus:border-yellow appearance-none cursor-pointer hover:bg-[#0d2538] transition-colors"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* Type filter */}
        <select
          value={type}
          onChange={(e) => onFilterChange('type', e.target.value)}
          className="bg-surface-deep text-sm text-white/80 border border-border-input rounded-lg px-3 py-2 focus:outline-none focus:border-yellow appearance-none cursor-pointer hover:bg-[#0d2538] transition-colors"
        >
          <option value="">All Types</option>
          <option value="phone">Phone Call</option>
          <option value="zoom">Zoom</option>
          <option value="onsite">On-site</option>
        </select>

        {/* Clear all button */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 text-xs font-bold text-yellow/80 hover:text-yellow border border-yellow/20 hover:border-yellow/50 bg-yellow/5 px-3 py-2 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear Filters
          </button>
        )}
      </div>

      {/* Row 2: Date Range */}
      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-xs text-white/40 font-medium uppercase tracking-wider">Date range:</span>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onFilterChange('dateFrom', e.target.value)}
            className="bg-surface-deep text-sm text-white/80 border border-border-input rounded-lg px-3 py-1.5 focus:outline-none focus:border-yellow transition-all cursor-pointer [color-scheme:dark]"
          />
          <span className="text-white/30 text-xs">→</span>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => onFilterChange('dateTo', e.target.value)}
            className="bg-surface-deep text-sm text-white/80 border border-border-input rounded-lg px-3 py-1.5 focus:outline-none focus:border-yellow transition-all cursor-pointer [color-scheme:dark]"
          />
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { onFilterChange('dateFrom', ''); onFilterChange('dateTo', ''); }}
              className="text-white/30 hover:text-white transition-colors"
              title="Clear date range"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Active filter chips summary */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1.5 ml-auto">
            {status && (
              <span className="text-xs font-bold bg-yellow/10 text-yellow border border-yellow/20 px-2 py-0.5 rounded-full capitalize">
                {status}
              </span>
            )}
            {type && (
              <span className="text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full capitalize">
                {type}
              </span>
            )}
            {(dateFrom || dateTo) && (
              <span className="text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full">
                {dateFrom || '…'} → {dateTo || '…'}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
