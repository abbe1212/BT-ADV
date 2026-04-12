/**
 * Admin UI Types
 * --------------
 * Types that are specific to the admin panel's UI state.
 * These are separate from the DB entity types in /lib/supabase/types.ts.
 */

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationState {
  page: number;       // 1-indexed current page
  pageSize: number;   // rows per page
  total: number;      // total row count from server
}

export const DEFAULT_PAGE_SIZE = 20;

export const defaultPaginationState: PaginationState = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  total: 0,
};

// ─── Booking filters (UI state) ───────────────────────────────────────────────

export interface BookingFilterState {
  search: string;
  status: 'pending' | 'confirmed' | 'cancelled' | '';
  type: 'phone' | 'onsite' | 'zoom' | '';
  dateFrom: string;
  dateTo: string;
}

export const defaultBookingFilters: BookingFilterState = {
  search: '',
  status: '',
  type: '',
  dateFrom: '',
  dateTo: '',
};

// ─── Bulk actions ─────────────────────────────────────────────────────────────

export type BulkAction = 'confirm' | 'cancel' | 'delete';

export interface BulkActionState {
  selectedIds: string[];
  isProcessing: boolean;
}

export const defaultBulkActionState: BulkActionState = {
  selectedIds: [],
  isProcessing: false,
};

// ─── Modal state (generic) ────────────────────────────────────────────────────

export type ModalMode = 'create' | 'edit' | 'view' | 'closed';

export interface ModalState<T = null> {
  mode: ModalMode;
  data: T | null;
}

export function closedModal<T = null>(): ModalState<T> {
  return { mode: 'closed', data: null };
}

// ─── Async operation state ────────────────────────────────────────────────────

/** Tracks which row IDs are currently in a loading state (e.g. saving, deleting) */
export type LoadingIds = Set<string>;

// ─── Admin notification ───────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface AdminToast {
  id: string;
  message: string;
  type: ToastType;
}
