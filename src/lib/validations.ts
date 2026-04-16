/**
 * Central Zod Schemas — Admin Mutation Validation
 * ─────────────────────────────────────────────────────────────────────────────
 * All server-side validation schemas for admin CRUD operations.
 * Every Server Action in src/actions/* must parse its payload through
 * the corresponding schema before touching the database.
 *
 * Rules applied across all schemas:
 *  - Strings are trimmed to prevent whitespace-only inputs
 *  - Required Arabic fields must be at least 1 character
 *  - URLs validated with z.url() where applicable
 *  - IDs validated as UUID to prevent injection via ID params
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { z } from 'zod';

// ─── Shared primitives ────────────────────────────────────────────────────────

const uuidSchema = z.string().uuid('Invalid ID format');
const urlSchema  = z.string().url('Invalid URL').or(z.literal('').transform(() => null)).nullish();
const orderIndex = z.number().int().min(0).optional();

// ─── Works ────────────────────────────────────────────────────────────────────

export const WorkInsertSchema = z.object({
  title_ar:    z.string().trim().min(1, 'Arabic title is required').max(200),
  title_en:    z.string().trim().max(200).nullish(),
  category:    z.string().trim().min(1, 'Category is required'),
  image_url:   z.string().url('Cover image must be a valid URL'),
  video_url:   urlSchema,
  year:        z.number().int().min(2000).max(new Date().getFullYear() + 1),
  featured:    z.boolean().optional(),
  order_index: orderIndex,
  client_id:   uuidSchema.nullish(),
});

export const WorkUpdateSchema = WorkInsertSchema.partial().extend({
  id: uuidSchema,
});

// ─── Team ─────────────────────────────────────────────────────────────────────

export const TeamMemberInsertSchema = z.object({
  name_ar:     z.string().trim().min(1, 'Arabic name is required').max(100),
  name_en:     z.string().trim().max(100).nullish(),
  role_ar:     z.string().trim().min(1, 'Arabic role is required').max(100),
  role_en:     z.string().trim().max(100).nullish(),
  image_url:   urlSchema,
  is_featured: z.boolean().optional(),
  order_index: orderIndex,
});

export const TeamMemberUpdateSchema = TeamMemberInsertSchema.partial().extend({
  id: uuidSchema,
});

// ─── Pricing ──────────────────────────────────────────────────────────────────

export const PricingInsertSchema = z.object({
  category:    z.string().trim().min(1, 'Category is required'),
  title_ar:    z.string().trim().min(1, 'Arabic title is required').max(200),
  title_en:    z.string().trim().max(200).nullish(),
  price_from:  z.number().min(0),
  price_to:    z.number().min(0).nullish(),
  price_note:  z.string().trim().max(300).nullish(),
  is_popular:  z.boolean().optional(),
  order_index: orderIndex,
});

export const PricingUpdateSchema = PricingInsertSchema.partial().extend({
  id: uuidSchema,
});

// ─── Services ─────────────────────────────────────────────────────────────────

export const ServiceInsertSchema = z.object({
  title_ar:       z.string().trim().min(1, 'Arabic title is required').max(200),
  title_en:       z.string().trim().max(200).nullish(),
  description_ar: z.string().trim().max(1000).nullish(),
  description_en: z.string().trim().max(1000).nullish(),
  icon:           z.string().trim().max(50).nullish(),
  order_index:    orderIndex,
});

export const ServiceUpdateSchema = ServiceInsertSchema.partial().extend({
  id: uuidSchema,
});

// ─── Careers ──────────────────────────────────────────────────────────────────

export const CareerInsertSchema = z.object({
  title_ar:       z.string().trim().min(1, 'Arabic title is required').max(200),
  title_en:       z.string().trim().max(200).nullish(),
  department:     z.string().trim().min(1, 'Department is required').max(100),
  type:           z.string().trim().min(1, 'Type is required').max(50),
  description_ar: z.string().trim().max(2000).nullish(),
  description_en: z.string().trim().max(2000).nullish(),
  is_open:        z.boolean().optional(),
});

export const CareerUpdateSchema = CareerInsertSchema.partial().extend({
  id: uuidSchema,
});

// ─── BTS ──────────────────────────────────────────────────────────────────────

export const BtsItemInsertSchema = z.object({
  media_url:   z.string().url('Media URL must be a valid URL'),
  media_type:  z.enum(['image', 'video']),
  title_ar:    z.string().trim().max(200).nullish(),
  title_en:    z.string().trim().max(200).nullish(),
  order_index: orderIndex,
});

export const BtsItemUpdateSchema = BtsItemInsertSchema.partial().extend({
  id: uuidSchema,
});

// ─── Clients ──────────────────────────────────────────────────────────────────

export const ClientInsertSchema = z.object({
  name:        z.string().trim().min(1, 'Client name is required').max(100),
  slug:        z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  logo_url:    urlSchema,
  youtube_url: urlSchema,
  website_url: urlSchema,
  industry:    z.string().trim().max(100).nullish(),
  order_index: orderIndex,
});

export const ClientUpdateSchema = ClientInsertSchema.partial().extend({
  id: uuidSchema,
});

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const ReviewInsertSchema = z.object({
  client_id:     uuidSchema,
  reviewer_name: z.string().trim().min(1, 'Reviewer name is required').max(100),
  reviewer_role: z.string().trim().max(100).nullish(),
  content_ar:    z.string().trim().min(1, 'Arabic content is required').max(2000),
  content_en:    z.string().trim().max(2000).nullish(),
  rating:        z.number().int().min(1).max(5).optional(),
  is_featured:   z.boolean().optional(),
  order_index:   orderIndex,
});

export const ReviewUpdateSchema = ReviewInsertSchema.partial().extend({
  id: uuidSchema,
});

// ─── Bookings (admin status updates only) ────────────────────────────────────

export const BookingStatusSchema = z.object({
  id:     uuidSchema,
  status: z.enum(['pending', 'confirmed', 'cancelled']),
});

// ─── Messages ─────────────────────────────────────────────────────────────────

export const MessageIdSchema = uuidSchema;

// ─── Site Settings ────────────────────────────────────────────────────────────

export const SiteSettingSchema = z.object({
  key:   z.string().trim().min(1).max(100),
  value: z.string().max(2000),
});

export const SiteSettingsSchema = z.record(
  z.string().trim().min(1).max(100),
  z.string().max(2000)
);
