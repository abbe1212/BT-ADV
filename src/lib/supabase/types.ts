// ─── works ────────────────────────────────────────────────────────────────────
export interface Work {
  id: string;
  title_ar: string;
  title_en: string | null;
  category: string;
  image_url: string;
  video_url: string | null;
  year: number;
  featured: boolean;
  order_index: number;
  created_at: string;
  client_id: string | null;
  clients?: Client; // joined
}

// ─── pricing ──────────────────────────────────────────────────────────────────
export interface Pricing {
  id: string;
  category: string;
  title_ar: string;
  title_en: string | null;
  price_from: number;
  price_to: number | null;
  price_note: string | null;
  is_popular: boolean;
  order_index: number;
}

// ─── services ─────────────────────────────────────────────────────────────────
export interface Service {
  id: string;
  title_ar: string;
  title_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  icon: string | null;
  order_index: number;
}

// ─── bookings ─────────────────────────────────────────────────────────────────
export interface Booking {
  id: string;
  ref_code: string;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  date: string;          // YYYY-MM-DD
  time_slot: string;     // HH:MM
  type: 'phone' | 'onsite' | 'zoom';
  estimated_budget: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string | null;
  company_brief: string | null;
  industry: string | null;
  has_brand_guide: boolean;
  previous_ads: boolean;
  target_audience: 'youth' | 'families' | 'businesses' | 'general' | null;
  platforms: string[] | null;
  created_at: string;
}

export interface BookingInsert {
  ref_code: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  date: string;
  time_slot: string;
  type: 'phone' | 'onsite' | 'zoom';
  estimated_budget?: string;
  status: 'pending';
  notes?: string;
  company_brief?: string | null;
  industry?: string | null;
  has_brand_guide?: boolean;
  previous_ads?: boolean;
  target_audience?: 'youth' | 'families' | 'businesses' | 'general' | null;
  platforms?: string[] | null;
}

// ─── bts ──────────────────────────────────────────────────────────────────────
export interface BtsItem {
  id: string;
  title_ar: string | null;
  title_en: string | null;
  media_url: string;
  media_type: 'image' | 'video';
  order_index: number;
  created_at: string;
}

// ─── team ─────────────────────────────────────────────────────────────────────
export interface TeamMember {
  id: string;
  name_ar: string;
  name_en: string | null;
  role_ar: string;
  role_en: string | null;
  image_url: string | null;
  is_featured: boolean;
  order_index: number;
}

// ─── careers ──────────────────────────────────────────────────────────────────
export interface Career {
  id: string;
  title_ar: string;
  title_en: string | null;
  department: string;
  type: string;
  description_ar: string | null;
  description_en: string | null;
  is_open: boolean;
  created_at: string;
}

// ─── contact_messages ─────────────────────────────────────────────────────────
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface ContactMessageInsert {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

// ─── clients ──────────────────────────────────────────────────────────────────
export interface Client {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  youtube_url: string | null;
  website_url: string | null;
  industry: string | null;
  order_index: number;
  created_at: string;
}

// ─── reviews ──────────────────────────────────────────────────────────────────
export interface Review {
  id: string;
  client_id: string;
  reviewer_name: string;
  reviewer_role: string | null;
  content_ar: string;
  content_en: string | null;
  rating: number;
  is_featured: boolean;
  order_index: number;
  created_at: string;
  clients?: Client; // joined
}

// ─── client_logos (deprecated) ────────────────────────────────────────────────
export interface ClientLogo {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  order_index: number;
}

// ─── site_settings ────────────────────────────────────────────────────────────
export interface SiteSetting {
  key: string;
  value: string;
  updated_at: string;
}

// ─── user_roles ───────────────────────────────────────────────────────────────
export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'super_admin';
  created_at: string;
}
