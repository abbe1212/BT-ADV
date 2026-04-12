import React from 'react';
import { Loader2 } from 'lucide-react';
import type { Booking } from '@/lib/supabase/types';

type BookingStatus = Booking['status'];

interface BookingStatusBadgeProps {
  status: BookingStatus;
  /** When true, shows a spinner instead of the label (e.g. during a status mutation) */
  isLoading?: boolean;
  /** Optional CSS class overrides */
  className?: string;
}

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending:   'bg-amber-400/10   text-amber-400   border-amber-400/20',
  confirmed: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  cancelled: 'bg-red-400/10     text-red-400     border-red-400/20',
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending:   'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
};

/**
 * Reusable status pill for bookings.
 * Used in BookingsTable, RecentBookingsWidget, and any future
 * admin views that display booking status.
 */
export function BookingStatusBadge({ status, isLoading = false, className = '' }: BookingStatusBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-3 py-1 text-xs font-bold rounded-full border
        ${STATUS_STYLES[status]}
        ${className}
      `}
    >
      {isLoading
        ? <Loader2 className="w-3 h-3 animate-spin" />
        : STATUS_LABELS[status]
      }
    </span>
  );
}
