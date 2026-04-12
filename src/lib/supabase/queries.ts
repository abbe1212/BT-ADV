import { createClient } from './server';
import type {
  Work, Pricing, Service, BtsItem, TeamMember,
  Career, ClientLogo, SiteSetting, BookingInsert, ContactMessageInsert,
  Booking, ContactMessage, Client, Review
} from './types';

// ─── works ────────────────────────────────────────────────────────────────────

export async function getWorks(category?: string): Promise<Work[]> {
  const supabase = await createClient();
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
}

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

export async function getWorkById(id: string): Promise<Work | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('works')
    .select('*')
    .eq('id', id)
    .single();

  if (error) { console.error('[getWorkById]', error.message); return null; }
  return data as Work;
}

export async function getNextWork(currentOrderIndex: number): Promise<Work | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('works')
    .select('*')
    .gt('order_index', currentOrderIndex)
    .order('order_index', { ascending: true })
    .limit(1)
    .single();

  if (error) {
    // If no next work, get the first one (loop around)
    const { data: firstData, error: firstError } = await supabase
      .from('works')
      .select('*')
      .order('order_index', { ascending: true })
      .limit(1)
      .single();
    
    if (firstError) return null;
    return firstData as Work;
  }
  return data as Work;
}

export async function getFeaturedWorks(): Promise<Work[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('works')
    .select('*')
    .eq('featured', true)
    .order('order_index', { ascending: true });

  if (error) { console.error('[getFeaturedWorks]', error.message); return []; }
  return data as Work[];
}

// ─── pricing ──────────────────────────────────────────────────────────────────

export async function getPricing(): Promise<Record<string, Pricing[]>> {
  const supabase = await createClient();
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
}

// ─── services ─────────────────────────────────────────────────────────────────

export async function getServices(): Promise<Service[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) { console.error('[getServices]', error.message); return []; }
  return data as Service[];
}

// ─── bts ──────────────────────────────────────────────────────────────────────

export async function getBts(): Promise<BtsItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bts')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) { console.error('[getBts]', error.message); return []; }
  return data as BtsItem[];
}

// ─── team ─────────────────────────────────────────────────────────────────────

export async function getTeam(featuredOnly = false): Promise<TeamMember[]> {
  const supabase = await createClient();
  let query = supabase
    .from('team')
    .select('*')
    .order('order_index', { ascending: true });

  if (featuredOnly) query = query.eq('is_featured', true);

  const { data, error } = await query;
  if (error) { console.error('[getTeam]', error.message); return []; }
  return data as TeamMember[];
}

// ─── careers ──────────────────────────────────────────────────────────────────

export async function getCareers(openOnly = true): Promise<Career[]> {
  const supabase = await createClient();
  let query = supabase
    .from('careers')
    .select('*')
    .order('created_at', { ascending: false });

  if (openOnly) query = query.eq('is_open', true);

  const { data, error } = await query;
  if (error) { console.error('[getCareers]', error.message); return []; }
  return data as Career[];
}

// ─── clients ──────────────────────────────────────────────────────────────────

export async function getClients(): Promise<Client[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) { console.error('[getClients]', error.message); return []; }
  return data as Client[];
}

export async function getClientBySlug(slug: string): Promise<Client | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) { console.error('[getClientBySlug]', error.message); return null; }
  return data as Client;
}

export async function getClientWithRelations(slug: string): Promise<{ client: Client, works: Work[], reviews: Review[] } | null> {
  const supabase = await createClient();
  const { data: client, error: clientErr } = await supabase
    .from('clients')
    .select('*')
    .eq('slug', slug)
    .single();

  if (clientErr || !client) return null;

  const [{ data: works }, { data: reviews }] = await Promise.all([
    supabase.from('works').select('*').eq('client_id', client.id).order('order_index', { ascending: true }),
    supabase.from('reviews').select('*').eq('client_id', client.id).order('order_index', { ascending: true }),
  ]);

  return {
    client: client as Client,
    works: (works as Work[]) || [],
    reviews: (reviews as Review[]) || [],
  };
}

// ─── reviews ──────────────────────────────────────────────────────────────────

export async function getAllReviews(): Promise<Review[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*, clients(*)')
    .order('created_at', { ascending: false });

  if (error) { console.error('[getAllReviews]', error.message); return []; }
  return data as Review[];
}

export async function getFeaturedReviews(): Promise<Review[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*, clients(*)')
    .eq('is_featured', true)
    .order('order_index', { ascending: true });

  if (error) { console.error('[getFeaturedReviews]', error.message); return []; }
  return data as Review[];
}

export async function getReviewsByClient(clientId: string): Promise<Review[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*, clients(*)')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) { console.error('[getReviewsByClient]', error.message); return []; }
  return data as Review[];
}

// ─── client_logos (deprecated) ────────────────────────────────────────────────

export async function getClientLogos(): Promise<ClientLogo[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('client_logos')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) { console.error('[getClientLogos]', error.message); return []; }
  return data as ClientLogo[];
}

// ─── site_settings ────────────────────────────────────────────────────────────

export async function getSiteSettings(): Promise<Record<string, string>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('site_settings').select('*');

  if (error) { console.error('[getSiteSettings]', error.message); return {}; }
  return (data as SiteSetting[]).reduce<Record<string, string>>((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
}

// ─── bookings ─────────────────────────────────────────────────────────────────

/** Returns already-booked time_slots for a given date string (YYYY-MM-DD) */
export async function getBookedSlots(date: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('time_slot')
    .eq('date', date)
    .in('status', ['pending', 'confirmed']);

  if (error) { console.error('[getBookedSlots]', error.message); return []; }
  return (data as { time_slot: string }[]).map((r) => r.time_slot);
}

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
  
  // Get current month boundaries
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

  // Parallel queries for stats
  const [
    totalResult,
    pendingResult,
    thisMonthResult,
    lastMonthResult,
    messagesResult,
    phoneResult,
    zoomResult,
    onsiteResult,
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
    totalBookings: totalResult.count ?? 0,
    pendingBookings: pendingResult.count ?? 0,
    thisMonthBookings: thisMonthResult.count ?? 0,
    lastMonthBookings: lastMonthResult.count ?? 0,
    newMessages: messagesResult.count ?? 0,
    bookingsByType: {
      phone: phoneResult.count ?? 0,
      zoom: zoomResult.count ?? 0,
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
