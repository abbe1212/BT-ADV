/**
 * Zustand Admin Store
 * -------------------
 * Centralised client-side state for the admin panel.
 *
 * Split into logical slices:
 *   • bookingsSlice  — filter + pagination + bulk selection for the bookings page
 *   • worksSlice     — modal state for the works page
 *   • uiSlice        — shared UI flags (sidebar collapse, etc.)
 *
 * Server data (rows, counts) lives in React Query — NOT here.
 * This store only owns transient UI state.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  BookingFilterState,
  BulkActionState,
  PaginationState,
  ModalState,
} from '@/types/admin';
import {
  defaultBookingFilters,
  defaultBulkActionState,
  defaultPaginationState,
  closedModal,
  DEFAULT_PAGE_SIZE,
} from '@/types/admin';
import type { Work } from '@/lib/supabase/types';

// ─── Bookings Slice ───────────────────────────────────────────────────────────

interface BookingsSlice {
  bookingFilters: BookingFilterState;
  bookingPagination: PaginationState;
  bookingBulk: BulkActionState;

  setBookingFilter: <K extends keyof BookingFilterState>(
    key: K,
    value: BookingFilterState[K]
  ) => void;
  resetBookingFilters: () => void;

  setBookingPage: (page: number) => void;
  setBookingTotal: (total: number) => void;
  setBookingPageSize: (size: number) => void;

  toggleRowSelection: (id: string) => void;
  selectAllRows: (ids: string[]) => void;
  clearSelection: () => void;
  setBulkProcessing: (isProcessing: boolean) => void;
}

// ─── Works Slice ──────────────────────────────────────────────────────────────

interface WorksSlice {
  workModal: ModalState<Work>;
  openCreateWork: () => void;
  openEditWork: (work: Work) => void;
  closeWorkModal: () => void;
}

// ─── UI Slice ─────────────────────────────────────────────────────────────────

interface UISlice {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

// ─── Combined Store ───────────────────────────────────────────────────────────

type AdminStore = BookingsSlice & WorksSlice & UISlice;

export const useAdminStore = create<AdminStore>()(
  devtools(
    (set) => ({
      // ── Bookings state ──────────────────────────────────────────────────────
      bookingFilters: defaultBookingFilters,
      bookingPagination: defaultPaginationState,
      bookingBulk: defaultBulkActionState,

      setBookingFilter: (key, value) =>
        set(
          (state) => ({
            bookingFilters: { ...state.bookingFilters, [key]: value },
            // Reset to page 1 whenever a filter changes
            bookingPagination: { ...state.bookingPagination, page: 1 },
          }),
          false,
          'bookings/setFilter'
        ),

      resetBookingFilters: () =>
        set(
          {
            bookingFilters: defaultBookingFilters,
            bookingPagination: defaultPaginationState,
          },
          false,
          'bookings/resetFilters'
        ),

      setBookingPage: (page) =>
        set(
          (state) => ({
            bookingPagination: { ...state.bookingPagination, page },
          }),
          false,
          'bookings/setPage'
        ),

      setBookingTotal: (total) =>
        set(
          (state) => ({
            bookingPagination: { ...state.bookingPagination, total },
          }),
          false,
          'bookings/setTotal'
        ),

      setBookingPageSize: (size) =>
        set(
          (state) => ({
            bookingPagination: { ...state.bookingPagination, pageSize: size, page: 1 },
          }),
          false,
          'bookings/setPageSize'
        ),

      toggleRowSelection: (id) =>
        set(
          (state) => {
            const already = state.bookingBulk.selectedIds.includes(id);
            return {
              bookingBulk: {
                ...state.bookingBulk,
                selectedIds: already
                  ? state.bookingBulk.selectedIds.filter((s) => s !== id)
                  : [...state.bookingBulk.selectedIds, id],
              },
            };
          },
          false,
          'bookings/toggleRow'
        ),

      selectAllRows: (ids) =>
        set(
          (state) => ({ bookingBulk: { ...state.bookingBulk, selectedIds: ids } }),
          false,
          'bookings/selectAll'
        ),

      clearSelection: () =>
        set(
          (state) => ({ bookingBulk: { ...state.bookingBulk, selectedIds: [] } }),
          false,
          'bookings/clearSelection'
        ),

      setBulkProcessing: (isProcessing) =>
        set(
          (state) => ({ bookingBulk: { ...state.bookingBulk, isProcessing } }),
          false,
          'bookings/setBulkProcessing'
        ),

      // ── Works modal state ───────────────────────────────────────────────────
      workModal: closedModal<Work>(),

      openCreateWork: () =>
        set({ workModal: { mode: 'create', data: null } }, false, 'works/openCreate'),

      openEditWork: (work: Work) =>
        set({ workModal: { mode: 'edit', data: work } }, false, 'works/openEdit'),

      closeWorkModal: () =>
        set({ workModal: closedModal<Work>() }, false, 'works/closeModal'),

      // ── UI state ────────────────────────────────────────────────────────────
      isSidebarCollapsed: false,
      toggleSidebar: () =>
        set(
          (state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed }),
          false,
          'ui/toggleSidebar'
        ),
    }),
    { name: 'AdminStore' }
  )
);

// ─── Convenience selectors ────────────────────────────────────────────────────

/** Derived: offset for the current page (for Supabase .range()) */
export const selectBookingOffset = (state: AdminStore) =>
  (state.bookingPagination.page - 1) * state.bookingPagination.pageSize;

/** Derived: total number of pages */
export const selectTotalPages = (state: AdminStore) =>
  Math.ceil(state.bookingPagination.total / state.bookingPagination.pageSize) || 1;

/** Derived: whether all displayed IDs are selected */
export const selectIsAllSelected = (displayedIds: string[]) => (state: AdminStore) =>
  displayedIds.length > 0 &&
  displayedIds.every((id) => state.bookingBulk.selectedIds.includes(id));

/** Re-export DEFAULT_PAGE_SIZE from types for consumers */
export { DEFAULT_PAGE_SIZE };
