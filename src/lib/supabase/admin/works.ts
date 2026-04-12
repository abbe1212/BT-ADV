/**
 * Admin Works — Data Layer
 * ------------------------
 * Server-side query functions for the admin works page.
 * All functions use the server-side Supabase client.
 *
 * Pagination defaults to 12 per page (works well for a 3-column grid).
 */

import { createClient } from '../server';
import type { Work } from '../types';

export interface WorkQueryFilters {
  limit?: number;
  offset?: number;
  category?: string;
  featured?: boolean;
  search?: string;
}

export interface WorkQueryResult {
  data: Work[];
  count: number;
}

/**
 * Fetches a paginated list of works for the admin panel.
 * Supports category filtering and free-text search on both titles.
 *
 * @example
 * const { data, count } = await getAdminWorks({ limit: 12, offset: 0 });
 */
export async function getAdminWorks(
  filters: WorkQueryFilters = {}
): Promise<WorkQueryResult> {
  const supabase = await createClient();

  let query = supabase
    .from('works')
    .select('*', { count: 'exact' })
    .order('order_index', { ascending: true });

  if (filters.category && filters.category !== 'All') {
    query = query.eq('category', filters.category);
  }

  if (filters.featured !== undefined) {
    query = query.eq('featured', filters.featured);
  }

  if (filters.search) {
    query = query.or(
      `title_ar.ilike.%${filters.search}%,title_en.ilike.%${filters.search}%`
    );
  }

  const limit = filters.limit ?? 12;
  const offset = filters.offset ?? 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('[getAdminWorks]', error.message);
    return { data: [], count: 0 };
  }

  return { data: data as Work[], count: count ?? 0 };
}

/**
 * Returns the count of works for each category.
 * Useful for showing category badges in the filter bar.
 */
export async function getWorkCategoryCounts(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('works')
    .select('category');

  if (error) {
    console.error('[getWorkCategoryCounts]', error.message);
    return {};
  }

  return (data as { category: string }[]).reduce<Record<string, number>>((acc, row) => {
    acc[row.category] = (acc[row.category] ?? 0) + 1;
    return acc;
  }, {});
}
