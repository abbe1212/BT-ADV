/**
 * Admin Mutations Library
 * Client-side Supabase mutations for admin CRUD operations
 */

import { createClient } from './client';
import type {
  Work, Pricing, Service, BtsItem, TeamMember,
  Career, ClientLogo, Booking, ContactMessage,
  Client, Review
} from './types';

// ─── Generic Response Type ────────────────────────────────────────────────────
export interface MutationResult<T = void> {
  data: T | null;
  error: string | null;
}

// ─── Works ────────────────────────────────────────────────────────────────────

export interface WorkInsert {
  title_ar: string;
  title_en?: string | null;
  category: string;
  image_url: string;
  video_url?: string | null;
  year: number;
  featured?: boolean;
  order_index?: number;
  client_id?: string | null;
}

export interface WorkUpdate extends Partial<WorkInsert> {
  id: string;
}

export async function insertWork(payload: WorkInsert): Promise<MutationResult<Work>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('works')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('[insertWork]', error.message);
    return { data: null, error: error.message };
  }
  return { data: data as Work, error: null };
}

export async function updateWork({ id, ...payload }: WorkUpdate): Promise<MutationResult<Work>> {
  const supabase = createClient();
  
  // Debug: Check authentication status
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('[updateWork] No authenticated user found');
    return { data: null, error: 'Authentication required. Please log in to the admin panel.' };
  }
  
  const { data, error } = await supabase
    .from('works')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[updateWork] Error:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      userId: user.id,
      workId: id
    });
    
    // Provide more helpful error messages
    if (error.message.includes('single JSON object')) {
      return { 
        data: null, 
        error: 'Update failed: No rows affected. This usually means you lack permission or the work does not exist. Make sure you are logged in as an admin user and have run the RLS policies setup.'
      };
    }
    
    return { data: null, error: error.message };
  }
  return { data: data as Work, error: null };
}

export async function deleteWork(id: string): Promise<MutationResult> {
  const supabase = createClient();
  const { error } = await supabase
    .from('works')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteWork]', error.message);
    return { data: null, error: error.message };
  }
  return { data: null, error: null };
}

// ─── Team ─────────────────────────────────────────────────────────────────────

export interface TeamMemberInsert {
  name_ar: string;
  name_en?: string | null;
  role_ar: string;
  role_en?: string | null;
  image_url?: string | null;
  is_featured?: boolean;
  order_index?: number;
}

export interface TeamMemberUpdate extends Partial<TeamMemberInsert> {
  id: string;
}

export async function insertTeamMember(payload: TeamMemberInsert): Promise<MutationResult<TeamMember>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('team')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('[insertTeamMember]', error.message);
    return { data: null, error: error.message };
  }
  return { data: data as TeamMember, error: null };
}

export async function updateTeamMember({ id, ...payload }: TeamMemberUpdate): Promise<MutationResult<TeamMember>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('team')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[updateTeamMember]', error.message);
    return { data: null, error: error.message };
  }
  return { data: data as TeamMember, error: null };
}

export async function deleteTeamMember(id: string): Promise<MutationResult> {
  const supabase = createClient();
  const { error } = await supabase
    .from('team')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteTeamMember]', error.message);
    return { data: null, error: error.message };
  }
  return { data: null, error: null };
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

export interface PricingInsert {
  category: string;
  title_ar: string;
  title_en?: string | null;
  price_from: number;
  price_to?: number | null;
  price_note?: string | null;
  is_popular?: boolean;
  order_index?: number;
}

export interface PricingUpdate extends Partial<PricingInsert> {
  id: string;
}

export async function insertPricing(payload: PricingInsert): Promise<MutationResult<Pricing>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('pricing')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('[insertPricing]', error.message);
    return { data: null, error: error.message };
  }
  return { data: data as Pricing, error: null };
}

export async function updatePricing({ id, ...payload }: PricingUpdate): Promise<MutationResult<Pricing>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('pricing')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[updatePricing]', error.message);
    return { data: null, error: error.message };
  }
  return { data: data as Pricing, error: null };
}

export async function deletePricing(id: string): Promise<MutationResult> {
  const supabase = createClient();
  const { error } = await supabase
    .from('pricing')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deletePricing]', error.message);
    return { data: null, error: error.message };
  }
  return { data: null, error: null };
}

// ─── Services ─────────────────────────────────────────────────────────────────

export interface ServiceInsert {
  title_ar: string;
  title_en?: string | null;
  description_ar?: string | null;
  description_en?: string | null;
  icon?: string | null;
  order_index?: number;
}

export interface ServiceUpdate extends Partial<ServiceInsert> {
  id: string;
}

export async function insertService(payload: ServiceInsert): Promise<MutationResult<Service>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('services')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('[insertService]', error.message);
    return { data: null, error: error.message };
  }
  return { data: data as Service, error: null };
}

export async function updateService({ id, ...payload }: ServiceUpdate): Promise<MutationResult<Service>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('services')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[updateService]', error.message);
    return { data: null, error: error.message };
  }
  return { data: data as Service, error: null };
}

export async function deleteService(id: string): Promise<MutationResult> {
  const supabase = createClient();
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteService]', error.message);
    return { data: null, error: error.message };
  }
  return { data: null, error: null };
}

// ─── Careers ──────────────────────────────────────────────────────────────────

export interface CareerInsert {
  title_ar: string;
  title_en?: string | null;
  department: string;
  type: string;
  description_ar?: string | null;
  description_en?: string | null;
  is_open?: boolean;
}

export interface CareerUpdate extends Partial<CareerInsert> {
  id: string;
}

export async function insertCareer(payload: CareerInsert): Promise<MutationResult<Career>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('careers')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('[insertCareer]', error.message);
    return { data: null, error: error.message };
  }
  return { data: data as Career, error: null };
}

export async function updateCareer({ id, ...payload }: CareerUpdate): Promise<MutationResult<Career>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('careers')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[updateCareer]', error.message);
    return { data: null, error: error.message };
  }
  return { data: data as Career, error: null };
}

export async function deleteCareer(id: string): Promise<MutationResult> {
  const supabase = createClient();
  const { error } = await supabase
    .from('careers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteCareer]', error.message);
    return { data: null, error: error.message };
  }
  return { data: null, error: null };
}

// ─── BTS ──────────────────────────────────────────────────────────────────────

export interface BtsItemInsert {
  title_ar?: string | null;
  title_en?: string | null;
  media_url: string;
  media_type: 'image' | 'video';
  order_index?: number;
}

export interface BtsItemUpdate extends Partial<BtsItemInsert> {
  id: string;
}

export async function insertBtsItem(payload: BtsItemInsert): Promise<MutationResult<BtsItem>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('bts')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('[insertBtsItem]', error.message);
    return { data: null, error: error.message };
  }
  return { data: data as BtsItem, error: null };
}

export async function updateBtsItem({ id, ...payload }: BtsItemUpdate): Promise<MutationResult<BtsItem>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('bts')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[updateBtsItem]', error.message);
    return { data: null, error: error.message };
  }
  return { data: data as BtsItem, error: null };
}

export async function deleteBtsItem(id: string): Promise<MutationResult> {
  const supabase = createClient();
  const { error } = await supabase
    .from('bts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteBtsItem]', error.message);
    return { data: null, error: error.message };
  }
  return { data: null, error: null };
}

// ─── Clients ──────────────────────────────────────────────────────────────────

export interface ClientInsert {
  name: string;
  slug: string;
  logo_url?: string | null;
  youtube_url?: string | null;
  website_url?: string | null;
  industry?: string | null;
  order_index?: number;
}

export interface ClientUpdate extends Partial<ClientInsert> {
  id: string;
}

export async function insertClient(payload: ClientInsert): Promise<MutationResult<Client>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('clients')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('[insertClient]', error.message);
    if (error.message === 'Failed to fetch') {
      console.error('[insertClient] URL used:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.error('[insertClient] This is a network error. Possible reasons: 1) Dev server needs restarting, 2) Adblocker blocking .supabase.co, 3) CORS configuration.');
    }
    return { data: null, error: error.message };
  }
  return { data: data as Client, error: null };
}

export async function updateClient({ id, ...payload }: ClientUpdate): Promise<MutationResult<Client>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('clients')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[updateClient]', error.message);
    return { data: null, error: error.message };
  }
  return { data: data as Client, error: null };
}

export async function deleteClient(id: string): Promise<MutationResult> {
  const supabase = createClient();
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteClient]', error.message);
    return { data: null, error: error.message };
  }
  return { data: null, error: null };
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export interface ReviewInsert {
  client_id: string;
  reviewer_name: string;
  reviewer_role?: string | null;
  content_ar: string;
  content_en?: string | null;
  rating?: number;
  is_featured?: boolean;
  order_index?: number;
}

export interface ReviewUpdate extends Partial<ReviewInsert> {
  id: string;
}

export async function insertReview(payload: ReviewInsert): Promise<MutationResult<Review>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reviews')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('[insertReview]', error.message);
    return { data: null, error: error.message };
  }
  return { data: data as Review, error: null };
}

export async function updateReview({ id, ...payload }: ReviewUpdate): Promise<MutationResult<Review>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reviews')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[updateReview]', error.message);
    return { data: null, error: error.message };
  }
  return { data: data as Review, error: null };
}

export async function deleteReview(id: string): Promise<MutationResult> {
  const supabase = createClient();
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteReview]', error.message);
    return { data: null, error: error.message };
  }
  return { data: null, error: null };
}

// ─── Client Logos (deprecated) ────────────────────────────────────────────────

export interface ClientLogoInsert {
  name: string;
  logo_url: string;
  website_url?: string | null;
  order_index?: number;
}

export interface ClientLogoUpdate extends Partial<ClientLogoInsert> {
  id: string;
}

export async function insertClientLogo(payload: ClientLogoInsert): Promise<MutationResult<ClientLogo>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('client_logos')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('[insertClientLogo]', error.message);
    return { data: null, error: error.message };
  }
  return { data: data as ClientLogo, error: null };
}

export async function updateClientLogo({ id, ...payload }: ClientLogoUpdate): Promise<MutationResult<ClientLogo>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('client_logos')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[updateClientLogo]', error.message);
    return { data: null, error: error.message };
  }
  return { data: data as ClientLogo, error: null };
}

export async function deleteClientLogo(id: string): Promise<MutationResult> {
  const supabase = createClient();
  const { error } = await supabase
    .from('client_logos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteClientLogo]', error.message);
    return { data: null, error: error.message };
  }
  return { data: null, error: null };
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export async function updateBookingStatus(
  id: string, 
  status: 'pending' | 'confirmed' | 'cancelled'
): Promise<MutationResult<Booking>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[updateBookingStatus]', error.message);
    return { data: null, error: error.message };
  }
  return { data: data as Booking, error: null };
}

export async function deleteBooking(id: string): Promise<MutationResult> {
  const supabase = createClient();
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteBooking]', error.message);
    return { data: null, error: error.message };
  }
  return { data: null, error: null };
}

// ─── Contact Messages ─────────────────────────────────────────────────────────

export async function markMessageAsRead(id: string, is_read = true): Promise<MutationResult<ContactMessage>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('contact_messages')
    .update({ is_read })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[markMessageAsRead]', error.message);
    return { data: null, error: error.message };
  }
  return { data: data as ContactMessage, error: null };
}

export async function deleteMessage(id: string): Promise<MutationResult> {
  const supabase = createClient();
  const { error } = await supabase
    .from('contact_messages')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteMessage]', error.message);
    return { data: null, error: error.message };
  }
  return { data: null, error: null };
}

// ─── Site Settings ────────────────────────────────────────────────────────────

export async function updateSiteSetting(key: string, value: string): Promise<MutationResult> {
  const supabase = createClient();
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

  if (error) {
    console.error('[updateSiteSetting]', error.message);
    return { data: null, error: error.message };
  }
  return { data: null, error: null };
}

export async function updateSiteSettings(settings: Record<string, string>): Promise<MutationResult> {
  const supabase = createClient();
  const now = new Date().toISOString();
  const payload = Object.entries(settings).map(([key, value]) => ({
    key,
    value,
    updated_at: now,
  }));

  const { error } = await supabase
    .from('site_settings')
    .upsert(payload, { onConflict: 'key' });

  if (error) {
    console.error('[updateSiteSettings]', error.message);
    return { data: null, error: error.message };
  }
  return { data: null, error: null };
}
