/**
 * MediaService — Unified Media Abstraction Layer
 * ─────────────────────────────────────────────────────────────────────────────
 * SERVER-ONLY. The single entry point for all media operations.
 *
 * Usage:
 *   import { MediaService } from '@/lib/media/service';
 *
 * Key design decisions:
 *   - Components NEVER call Cloudinary or Supabase directly
 *   - URLs are NEVER stored in the DB — only provider + provider_id
 *   - Content-hash dedup prevents re-uploading the same file
 *   - Switching providers = add adapter + one switch case, zero component changes
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { compressImage, compressTeamImage, compressLogo } from './compress';
import { generateLQIP } from './lqip';
import { supabaseUpload, supabaseGetUrl, supabaseDelete } from './adapters/supabase-adapter';
import { cloudinaryUpload, cloudinaryGetUrl, cloudinaryDelete } from './adapters/cloudinary-adapter';
import type { MediaAsset, ResolvedMedia, MediaUploadResult, AssetType } from './types';

// ─── DB client (service role — server only) ───────────────────────────────────

function getDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

// ─── Path builders ────────────────────────────────────────────────────────────

function buildSupabasePath(assetType: AssetType, slug: string, hash: string): string {
  switch (assetType) {
    case 'team':      return `team/${slug}-${hash}.jpg`;
    case 'bts_image': return `bts/images/${slug}-${hash}.jpg`;
    case 'bts_video': return `bts/videos/${slug}-${hash}.mp4`;
    default:          return `misc/${slug}-${hash}.jpg`;
  }
}

function buildCloudinaryPublicId(slug: string, hash: string): string {
  return `${slug}-${hash}`;
}

// ─── Slug helper ──────────────────────────────────────────────────────────────

/**
 * Normalise a display name to a URL-safe slug.
 * e.g. "Ahmed Khalil" → "ahmed-khalil"
 */
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ─── MediaService ─────────────────────────────────────────────────────────────

export const MediaService = {

  // ── URL resolution ──────────────────────────────────────────────────────────

  /**
   * Resolve a stored MediaAsset to a concrete delivery URL + metadata.
   * This is a PURE function — no network calls.
   *
   * @param asset - The media_assets row from the DB
   * @param width - Optional width for responsive resizing (Cloudinary only for now)
   */
  getUrl(asset: MediaAsset, width?: number): ResolvedMedia {
    let src: string;

    switch (asset.provider) {
      case 'supabase':
        src = supabaseGetUrl(asset.provider_id);
        break;
      case 'cloudinary':
        src = cloudinaryGetUrl(asset.provider_id, width);
        break;
      default:
        throw new Error(`[MediaService] Unknown provider: ${(asset as MediaAsset).provider}`);
    }

    const resolvedWidth  = width ?? asset.width ?? 800;
    const resolvedHeight = width && asset.width && asset.height
      ? Math.round((asset.height / asset.width) * width)
      : (asset.height ?? 600);

    return {
      src,
      width:       resolvedWidth,
      height:      resolvedHeight,
      blurDataUrl: asset.blur_data_url ?? undefined,
      alt:         asset.alt_text,
    };
  },

  /**
   * Generate a responsive srcSet string from a Cloudinary asset.
   * Only useful for Cloudinary assets (Supabase has no on-the-fly transforms).
   */
  getSrcSet(asset: MediaAsset, widths = [320, 640, 960, 1280]): string {
    if (asset.provider !== 'cloudinary') {
      return `${supabaseGetUrl(asset.provider_id)} 1x`;
    }
    return widths.map((w) => `${cloudinaryGetUrl(asset.provider_id, w)} ${w}w`).join(', ');
  },

  // ── Image upload (→ Supabase) ───────────────────────────────────────────────

  /**
   * Full pipeline: compress → dedup check → upload to Supabase → persist to DB.
   *
   * @param buffer    - Raw input buffer (any image format)
   * @param assetType - 'team' | 'bts_image'
   * @param slug      - Human-readable slug for the filename (e.g. "ahmed-khalil")
   * @param altText   - Accessibility description
   */
  async uploadImage(
    buffer: Buffer,
    assetType: 'team' | 'bts_image',
    slug: string,
    altText = ''
  ): Promise<MediaUploadResult> {
    // 1. Compress → JPG (full quality for team, optimised for BTS)
    const compressed = assetType === 'team'
      ? await compressTeamImage(buffer)
      : await compressImage(buffer);

    // 2. Generate LQIP from compressed buffer
    const blurDataUrl = await generateLQIP(compressed.buffer);

    // 3. Dedup: check if this exact file already exists
    const db = getDb();
    const { data: existing } = await db
      .from('media_assets')
      .select('id, provider_id')
      .eq('provider', 'supabase')
      .eq('content_hash', compressed.contentHash)
      .maybeSingle();

    if (existing) {
      return {
        assetId: existing.id,
        url:     supabaseGetUrl(existing.provider_id),
        isDuplicate: true,
      };
    }

    // 4. Build storage path
    const cleanSlug = toSlug(slug);
    const path = buildSupabasePath(assetType, cleanSlug, compressed.contentHash);

    // 5. Upload to Supabase Storage
    await supabaseUpload({ path, buffer: compressed.buffer, mimeType: 'image/jpeg' });

    // 6. Persist to media_assets
    const { data: asset, error } = await db
      .from('media_assets')
      .insert({
        provider:      'supabase',
        provider_id:   path,
        path,
        asset_type:    assetType,
        width:         compressed.width,
        height:        compressed.height,
        file_size:     compressed.fileSizeBytes,
        content_hash:  compressed.contentHash,
        alt_text:      altText,
        blur_data_url: blurDataUrl,
      })
      .select('id')
      .single();

    if (error) throw new Error(`[MediaService.uploadImage] DB insert failed: ${error.message}`);

    return {
      assetId:     asset.id,
      url:         supabaseGetUrl(path),
      isDuplicate: false,
    };
  },

  // ── Video upload (→ Supabase) ───────────────────────────────────────────────

  /**
   * Upload a BTS video buffer directly to Supabase Storage (no transcoding).
   * Videos are stored as-is (assumed already optimised MP4).
   */
  async uploadVideo(
    buffer: Buffer,
    slug: string,
    altText = ''
  ): Promise<MediaUploadResult> {
    const hash = crypto.createHash('md5').update(buffer).digest('hex').slice(0, 8);

    // Dedup
    const db = getDb();
    const { data: existing } = await db
      .from('media_assets')
      .select('id, provider_id')
      .eq('provider', 'supabase')
      .eq('content_hash', hash)
      .maybeSingle();

    if (existing) {
      return { assetId: existing.id, url: supabaseGetUrl(existing.provider_id), isDuplicate: true };
    }

    const cleanSlug = toSlug(slug);
    const path = buildSupabasePath('bts_video', cleanSlug, hash);

    await supabaseUpload({ path, buffer, mimeType: 'video/mp4' });

    const { data: asset, error } = await db
      .from('media_assets')
      .insert({
        provider:     'supabase',
        provider_id:  path,
        path,
        asset_type:   'bts_video',
        file_size:    buffer.byteLength,
        content_hash: hash,
        alt_text:     altText,
      })
      .select('id')
      .single();

    if (error) throw new Error(`[MediaService.uploadVideo] DB insert failed: ${error.message}`);

    return { assetId: asset.id, url: supabaseGetUrl(path), isDuplicate: false };
  },

  // ── Logo upload (→ Cloudinary) ──────────────────────────────────────────────

  /**
   * Full pipeline: compress → WebP → dedup check → upload to Cloudinary → persist to DB.
   *
   * @param buffer     - Raw input buffer (PNG, JPG, or pre-rasterized SVG)
   * @param clientSlug - Client slug used as filename base (e.g. "pepsico")
   * @param altText    - Accessibility description
   */
  async uploadLogo(
    buffer: Buffer,
    clientSlug: string,
    altText = ''
  ): Promise<MediaUploadResult> {
    // 1. Compress → WebP
    const compressed = await compressLogo(buffer);

    // 2. Dedup
    const db = getDb();
    const { data: existing } = await db
      .from('media_assets')
      .select('id, provider_id')
      .eq('provider', 'cloudinary')
      .eq('content_hash', compressed.contentHash)
      .maybeSingle();

    if (existing) {
      return {
        assetId: existing.id,
        url:     cloudinaryGetUrl(existing.provider_id),
        isDuplicate: true,
      };
    }

    // 3. Build Cloudinary public_id
    const cleanSlug = toSlug(clientSlug);
    const publicId = buildCloudinaryPublicId(cleanSlug, compressed.contentHash);

    // 4. Upload to Cloudinary
    const result = await cloudinaryUpload(compressed.buffer, { publicId });

    // 5. Persist to media_assets
    const { data: asset, error } = await db
      .from('media_assets')
      .insert({
        provider:     'cloudinary',
        provider_id:  result.publicId,   // full path incl. folder
        path:         `portfolio/logos/${publicId}`,
        asset_type:   'logo',
        width:        result.width,
        height:       result.height,
        file_size:    result.bytes,
        content_hash: compressed.contentHash,
        alt_text:     altText,
      })
      .select('id')
      .single();

    if (error) throw new Error(`[MediaService.uploadLogo] DB insert failed: ${error.message}`);

    return {
      assetId:     asset.id,
      url:         result.secureUrl,
      isDuplicate: false,
    };
  },

  // ── Delete ──────────────────────────────────────────────────────────────────

  /**
   * Delete a media asset from both the provider storage and the DB.
   */
  async delete(assetId: string): Promise<void> {
    const db = getDb();

    const { data: asset, error } = await db
      .from('media_assets')
      .select('provider, provider_id')
      .eq('id', assetId)
      .single();

    if (error || !asset) throw new Error(`[MediaService.delete] Asset not found: ${assetId}`);

    // Delete from provider
    if (asset.provider === 'supabase') {
      await supabaseDelete(asset.provider_id);
    } else if (asset.provider === 'cloudinary') {
      await cloudinaryDelete(asset.provider_id);
    }

    // Delete from DB
    await db.from('media_assets').delete().eq('id', assetId);
  },

  // ── Fetch helpers ────────────────────────────────────────────────────────────

  /** Fetch all assets of a given type */
  async getByType(assetType: AssetType): Promise<MediaAsset[]> {
    const db = getDb();
    const { data, error } = await db
      .from('media_assets')
      .select('*')
      .eq('asset_type', assetType)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`[MediaService.getByType] ${error.message}`);
    return (data ?? []) as MediaAsset[];
  },

  /** Fetch a single asset by ID */
  async getById(id: string): Promise<MediaAsset | null> {
    const db = getDb();
    const { data, error } = await db
      .from('media_assets')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(`[MediaService.getById] ${error.message}`);
    return data as MediaAsset | null;
  },
};
