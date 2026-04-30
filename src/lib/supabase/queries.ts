import { createClient } from './server';
import { createAnonClient } from './anon-client';
import { unstable_cache } from 'next/cache';
import type {
  Work, Pricing, Service, BtsItem, TeamMember,
  Career, ClientLogo, SiteSetting, BookingInsert, ContactMessageInsert,
  Booking, ContactMessage, Client, Review
} from './types';

// ─── works ────────────────────────────────────────────────────────────────────

const _getWorks = async (category?: string): Promise<Work[]> => {
  const supabase = createAnonClient();
  let query = supabase
    .from('works')
    .select('*, clients(*)')
    .order('order_index', { ascending: true });

  if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) { console.error('[getWorks]', error.message); return []; }
  return data as Work[];
};

/**
 * Public portfolio works, cached for 1 hour.
 * Revalidated on-demand via: `revalidateTag('works')`
 */
export const getWorks = unstable_cache(
  _getWorks,
  ['works'],
  { revalidate: 3600, tags: ['works'] }
);

export interface GetAdminWorksFilters {
  limit?: number;
  offset?: number;
  search?: string;
  category?: string;
}

export async function getAllAdminWorks(
  filters?: GetAdminWorksFilters
): Promise<{ data: Work[]; count: number }> {
  const supabase = await createClient();
  let query = supabase
    .from('works')
    .select('*, clients(id, name, slug, logo_url)', { count: 'exact' })
    .order('order_index', { ascending: true });

  if (filters?.category && filters.category !== 'All') {
    query = query.eq('category', filters.category);
  }

  if (filters?.search) {
    query = query.or(
      `title_ar.ilike.%${filters.search}%,title_en.ilike.%${filters.search}%`
    );
  }

  if (filters?.limit !== undefined && filters?.offset !== undefined) {
    query = query.range(filters.offset, filters.offset + filters.limit - 1);
  } else if (filters?.limit !== undefined) {
    query = query.limit(filters.limit);
  }

  const { data, error, count } = await query;
  if (error) { console.error('[getAllAdminWorks]', error.message); return { data: [], count: 0 }; }
  return { data: data as Work[], count: count || 0 };
}

/**
 * Single work by ID — uses anon client (no cookies) so it is cacheable.
 * Revalidated on-demand via: `revalidateTag('works')`
 */
export const getWorkById = unstable_cache(
  async (id: string): Promise<Work | null> => {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from('works')
      .select('*')
      .eq('id', id)
      .single();

    if (error) { console.error('[getWorkById]', error.message); return null; }
    return data as Work;
  },
  ['work-by-id'],
  { revalidate: 3600, tags: ['works'] }
);

/**
 * Returns the next work in order for carousel/navigation.
 * Fixed: uses maybeSingle() + parallel first-work fallback to eliminate
 * the previous sequential two-query waterfall.
 */
/**
 * Returns the next work in order for carousel/navigation.
 * Short 5-minute cache so re-ordered works propagate quickly.
 * Revalidated on-demand via: `revalidateTag('works')`
 */
export const getNextWork = unstable_cache(
  async (currentOrderIndex: number): Promise<Work | null> => {
    const supabase = createAnonClient();

    // Fetch the next work AND the first work (fallback) in parallel.
    const [nextResult, firstResult] = await Promise.all([
      supabase
        .from('works')
        .select('*')
        .gt('order_index', currentOrderIndex)
        .order('order_index', { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('works')
        .select('*')
        .order('order_index', { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);

    return (nextResult.data ?? firstResult.data) as Work | null;
  },
  ['next-work'],
  { revalidate: 300, tags: ['works'] } // 5 min — shorter for navigation freshness
);

const _getFeaturedWorks = async (): Promise<Work[]> => {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('works')
    .select('*')
    .eq('featured', true)
    .order('order_index', { ascending: true });

  if (error) { console.error('[getFeaturedWorks]', error.message); return []; }
  return data as Work[];
};

/**
 * Featured works (used in home/about sections), cached for 1 hour.
 * Revalidated on-demand via: `revalidateTag('works')`
 */
export const getFeaturedWorks = unstable_cache(
  _getFeaturedWorks,
  ['featured-works'],
  { revalidate: 3600, tags: ['works'] }
);

// ─── pricing ──────────────────────────────────────────────────────────────────

const _getPricing = async (): Promise<Record<string, Pricing[]>> => {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('pricing')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) { console.error('[getPricing]', error.message); return {}; }

  // Group by category
  return (data as Pricing[]).reduce<Record<string, Pricing[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});
};

/**
 * Pricing table grouped by category, cached for 1 hour.
 * Revalidated on-demand via: `revalidateTag('pricing')`
 */
export const getPricing = unstable_cache(
  _getPricing,
  ['pricing'],
  { revalidate: 3600, tags: ['pricing'] }
);

// ─── services ─────────────────────────────────────────────────────────────────

const _getServices = async (): Promise<Service[]> => {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) { console.error('[getServices]', error.message); return []; }
  return data as Service[];
};

/**
 * Public services list, cached for 1 hour.
 * Revalidated on-demand via: `revalidateTag('services')`
 */
export const getServices = unstable_cache(
  _getServices,
  ['services'],
  { revalidate: 3600, tags: ['services'] }
);

// ─── bts ──────────────────────────────────────────────────────────────────────

const _getBts = async (): Promise<BtsItem[]> => {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('bts')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) { console.error('[getBts]', error.message); return []; }
  return data as BtsItem[];
};

/**
 * BTS media, cached for 1 hour.
 * Revalidated on-demand via: `revalidateTag('bts')`
 */
export const getBts = unstable_cache(
  _getBts,
  ['bts'],
  { revalidate: 3600, tags: ['bts'] }
);

// ─── team ─────────────────────────────────────────────────────────────────────

const _getTeam = async (featuredOnly = false): Promise<TeamMember[]> => {
  const supabase = createAnonClient();
  let query = supabase
    .from('team')
    .select('*')
    .order('order_index', { ascending: true });

  if (featuredOnly) query = query.eq('is_featured', true);

  const { data, error } = await query;
  if (error) { console.error('[getTeam]', error.message); return []; }
  return data as TeamMember[];
};

/**
 * Team members, cached for 1 hour. Two cache entries: full list and featured-only.
 * Revalidated on-demand via: `revalidateTag('team')`
 */
export const getTeam = unstable_cache(
  _getTeam,
  ['team'],
  { revalidate: 3600, tags: ['team'] }
);

// ─── careers ──────────────────────────────────────────────────────────────────

const _getCareers = async (openOnly = true): Promise<Career[]> => {
  const supabase = createAnonClient();
  let query = supabase
    .from('careers')
    .select('*')
    .order('created_at', { ascending: false });

  if (openOnly) query = query.eq('is_open', true);

  const { data, error } = await query;
  if (error) { console.error('[getCareers]', error.message); return []; }
  return data as Career[];
};

/**
 * Open job listings, cached for 1 hour.
 * Revalidated on-demand via: `revalidateTag('careers')`
 */
export const getCareers = unstable_cache(
  _getCareers,
  ['careers'],
  { revalidate: 3600, tags: ['careers'] }
);

// ─── clients ──────────────────────────────────────────────────────────────────

const _getClients = async (): Promise<Client[]> => {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) { console.error('[getClients]', error.message); return []; }
  return data as Client[];
};

/**
 * Public clients list, cached for 1 hour.
 * Revalidated on-demand via: `revalidateTag('clients')`
 */
export const getClients = unstable_cache(
  _getClients,
  ['clients'],
  { revalidate: 3600, tags: ['clients'] }
);

/**
 * Single client by slug, cached for 1 hour.
 * Revalidated on-demand via: `revalidateTag('clients')`
 */
export const getClientBySlug = unstable_cache(
  async (slug: string): Promise<Client | null> => {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) { console.error('[getClientBySlug]', error.message); return null; }
    return data as Client;
  },
  ['client-by-slug'],
  { revalidate: 3600, tags: ['clients'] }
);

/**
 * Fetches a client + their related works and reviews in a single
 * PostgREST nested-select (1 round-trip instead of 3). Cached for 1 hour.
 * Revalidated on-demand via: `revalidateTag('clients')`
 */
export const getClientWithRelations = unstable_cache(
  async (slug: string): Promise<{ client: Client, works: Work[], reviews: Review[] } | null> => {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from('clients')
      .select('*, works(*), reviews(*)')
      .eq('slug', slug)
      .order('order_index', { referencedTable: 'works', ascending: true })
      .order('order_index', { referencedTable: 'reviews', ascending: true })
      .single();

    if (error || !data) return null;

    const { works, reviews, ...client } = data as Client & { works: Work[]; reviews: Review[] };

    return {
      client: client as Client,
      works: works || [],
      reviews: reviews || [],
    };
  },
  ['client-with-relations'],
  { revalidate: 3600, tags: ['clients', 'works', 'reviews'] }
);

// ─── reviews ──────────────────────────────────────────────────────────────────

export async function getAllReviews(): Promise<Review[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*, clients(*)')
    .order('created_at', { ascending: false });

  if (error) { console.error('[getAllReviews]', error.message); return []; }
  return data as Review[];
}

const _getFeaturedReviews = async (): Promise<Review[]> => {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*, clients(*)')
    .eq('is_featured', true)
    .order('order_index', { ascending: true });

  if (error) { console.error('[getFeaturedReviews]', error.message); return []; }
  return data as Review[];
};

/**
 * Featured reviews for the home page, cached for 1 hour.
 * Revalidated on-demand via: `revalidateTag('reviews')`
 */
export const getFeaturedReviews = unstable_cache(
  _getFeaturedReviews,
  ['featured-reviews'],
  { revalidate: 3600, tags: ['reviews'] }
);

/**
 * Reviews for a specific client detail page, cached for 1 hour.
 * Revalidated on-demand via: `revalidateTag('reviews')`
 */
export const getReviewsByClient = unstable_cache(
  async (clientId: string): Promise<Review[]> => {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('*, clients(*)')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) { console.error('[getReviewsByClient]', error.message); return []; }
    return data as Review[];
  },
  ['reviews-by-client'],
  { revalidate: 3600, tags: ['reviews'] }
);

// ─── client_logos (deprecated) ────────────────────────────────────────────────

export async function getClientLogos(): Promise<ClientLogo[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('client_logos')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) { console.error('[getClientLogos]', error.message); return []; }
  return data as ClientLogo[];
}

// ─── site_settings ────────────────────────────────────────────────────────────

const _getSiteSettings = async (): Promise<Record<string, string>> => {
  const supabase = createAnonClient();
  const { data, error } = await supabase.from('site_settings').select('*');

  if (error) { console.error('[getSiteSettings]', error.message); return {}; }
  return (data as SiteSetting[]).reduce<Record<string, string>>((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
};

/**
 * Site-wide settings (hero images, etc.), cached for 1 hour.
 * Revalidated on-demand via: `revalidateTag('site-settings')`
 */
export const getSiteSettings = unstable_cache(
  _getSiteSettings,
  ['site-settings'],
  { revalidate: 3600, tags: ['site-settings'] }
);

// ─── bookings ─────────────────────────────────────────────────────────────────

/**
 * Returns already-booked time_slots for a given date string (YYYY-MM-DD).
 * Cached for 60 seconds to reduce DB hits from concurrent booking wizard users
 * while still reflecting near-real-time availability.
 * Revalidated on-demand via: `revalidateTag('booked-slots')`
 */
export const getBookedSlots = unstable_cache(
  async (date: string): Promise<string[]> => {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from('bookings')
      .select('time_slot')
      .eq('date', date)
      .in('status', ['pending', 'confirmed']);

    if (error) { console.error('[getBookedSlots]', error.message); return []; }
    return (data as { time_slot: string }[]).map((r) => r.time_slot);
  },
  ['booked-slots'],
  { revalidate: 60, tags: ['booked-slots'] }
);

// ─── admin queries ────────────────────────────────────────────────────────────

export async function getRecentBookings(limit = 5): Promise<Booking[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) { console.error('[getRecentBookings]', error.message); return []; }
  return data as Booking[];
}

export async function getRecentMessages(limit = 5): Promise<ContactMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) { console.error('[getRecentMessages]', error.message); return []; }
  return data as ContactMessage[];
}

export async function getRecentWorks(limit = 4): Promise<Work[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('works')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) { console.error('[getRecentWorks]', error.message); return []; }
  return data as Work[];
}

export interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  thisMonthBookings: number;
  lastMonthBookings: number;
  newMessages: number;
  bookingsByType: { phone: number; zoom: number; onsite: number };
}


export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  // Single RPC call — replaces 8 separate HTTP round-trips.
  // The Postgres function aggregates all stats in one query execution.
  // Run the SQL in supabase-security-fixes.sql to create this function.
  const { data, error } = await supabase.rpc('get_dashboard_stats');

  if (!error && data) {
    return {
      totalBookings:    data.total_bookings    ?? 0,
      pendingBookings:  data.pending_bookings  ?? 0,
      thisMonthBookings:data.this_month_bookings?? 0,
      lastMonthBookings:data.last_month_bookings?? 0,
      newMessages:      data.new_messages      ?? 0,
      bookingsByType: {
        phone:  data.phone_bookings  ?? 0,
        zoom:   data.zoom_bookings   ?? 0,
        onsite: data.onsite_bookings ?? 0,
      },
    };
  }

  // ── Fallback: RPC not yet deployed → run parallel queries ────────────────────
  if (error) console.warn('[getDashboardStats] RPC not found, falling back:', error.message);

  const now = new Date();
  const startOfMonth    = new Date(now.getFullYear(), now.getMonth(),     1).toISOString();
  const startOfLastMonth= new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const endOfLastMonth  = new Date(now.getFullYear(), now.getMonth(),     0).toISOString();

  const [
    totalResult, pendingResult, thisMonthResult, lastMonthResult,
    messagesResult, phoneResult, zoomResult, onsiteResult,
  ] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).gte('created_at', startOfLastMonth).lt('created_at', endOfLastMonth),
    supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('is_read', false),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('type', 'phone'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('type', 'zoom'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('type', 'onsite'),
  ]);

  return {
    totalBookings:     totalResult.count     ?? 0,
    pendingBookings:   pendingResult.count   ?? 0,
    thisMonthBookings: thisMonthResult.count ?? 0,
    lastMonthBookings: lastMonthResult.count ?? 0,
    newMessages:       messagesResult.count  ?? 0,
    bookingsByType: {
      phone:  phoneResult.count  ?? 0,
      zoom:   zoomResult.count   ?? 0,
      onsite: onsiteResult.count ?? 0,
    },
  };
}

// ─── admin: all bookings ──────────────────────────────────────────────────────

export interface GetBookingsFilters {
  limit?: number;
  offset?: number;
  search?: string;
  status?: string;
  type?: string;
  dateFrom?: string;  // ISO date string YYYY-MM-DD
  dateTo?: string;    // ISO date string YYYY-MM-DD
}

export async function getAllBookings(filters?: GetBookingsFilters): Promise<{ data: Booking[], count: number }> {
  const supabase = await createClient();
  let query = supabase
    .from('bookings')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,ref_code.ilike.%${filters.search}%`);
  }

  if (filters?.dateFrom) {
    query = query.gte('date', filters.dateFrom);
  }

  if (filters?.dateTo) {
    query = query.lte('date', filters.dateTo);
  }

  if (filters?.limit !== undefined && filters?.offset !== undefined) {
    query = query.range(filters.offset, filters.offset + filters.limit - 1);
  } else if (filters?.limit !== undefined) {
    query = query.limit(filters.limit);
  }

  const { data, error, count } = await query;

  if (error) { console.error('[getAllBookings]', error.message); return { data: [], count: 0 }; }
  return { data: data as Booking[], count: count || 0 };
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) { console.error('[getBookingById]', error.message); return null; }
  return data as Booking;
}

// ─── admin: all messages ──────────────────────────────────────────────────────

export async function getAllMessages(): Promise<ContactMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { console.error('[getAllMessages]', error.message); return []; }
  return data as ContactMessage[];
}

// ─── admin: all pricing (flat list) ───────────────────────────────────────────

export async function getAllPricing(): Promise<Pricing[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('pricing')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) { console.error('[getAllPricing]', error.message); return []; }
  return data as Pricing[];
}

// ─── admin: all careers (including closed) ────────────────────────────────────

export async function getAllCareers(): Promise<Career[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('careers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { console.error('[getAllCareers]', error.message); return []; }
  return data as Career[];
}

// ─── admin: user_roles ────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  user_id: string;
  role: 'admin' | 'super_admin';
  created_at: string;
  email?: string;
  name?: string;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { console.error('[getAdminUsers]', error.message); return []; }
  return data as AdminUser[];
}
