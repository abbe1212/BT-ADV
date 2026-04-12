/**
 * Admin Bookings — Data Layer
 * ---------------------------
 * Server-side query functions specifically for the admin bookings page.
 * All functions use server-side Supabase client (reads auth cookies securely).
 *
 * Pagination: uses Supabase .range() so only N rows are fetched per request.
 */

import { createClient } from '../server';
import type { Booking } from '../types';

export interface BookingQueryFilters {
  limit?: number;
  offset?: number;
  search?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | '';
  type?: 'phone' | 'onsite' | 'zoom' | '';
  dateFrom?: string;
  dateTo?: string;
}

export interface BookingQueryResult {
  data: Booking[];
  count: number;
}

/**
 * Fetches a paginated, filtered list of bookings.
 * Returns both the data rows and the exact total count for pagination.
 *
 * @example
 * const { data, count } = await getAdminBookings({ limit: 20, offset: 0, status: 'pending' });
 */
export async function getAdminBookings(
  filters: BookingQueryFilters = {}
): Promise<BookingQueryResult> {
  const supabase = await createClient();

  let query = supabase
    .from('bookings')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  // ── Server-side filters ────────────────────────────────────────────────────
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.type) {
    query = query.eq('type', filters.type);
  }

  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,ref_code.ilike.%${filters.search}%`
    );
  }

  if (filters.dateFrom) {
    query = query.gte('date', filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte('date', filters.dateTo);
  }

  // ── Pagination ─────────────────────────────────────────────────────────────
  if (filters.limit !== undefined && filters.offset !== undefined) {
    query = query.range(filters.offset, filters.offset + filters.limit - 1);
  } else if (filters.limit !== undefined) {
    query = query.limit(filters.limit);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('[getAdminBookings]', error.message);
    return { data: [], count: 0 };
  }

  return { data: data as Booking[], count: count ?? 0 };
}

/**
 * Fetches a single booking by ID.
 */
export async function getAdminBookingById(id: string): Promise<Booking | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[getAdminBookingById]', error.message);
    return null;
  }
  return data as Booking;
}

/**
 * Fetches the count of bookings for each status.
 * Used to display summary badges in the admin header or filter bar.
 */
export async function getBookingStatusCounts(): Promise<{
  pending: number;
  confirmed: number;
  cancelled: number;
}> {
  const supabase = await createClient();

  const [pendingResult, confirmedResult, cancelledResult] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
  ]);

  return {
    pending: pendingResult.count ?? 0,
    confirmed: confirmedResult.count ?? 0,
    cancelled: cancelledResult.count ?? 0,
  };
}
