/**
 * Media Layer – Shared Types
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all media-related types.
 * Used across adapters, the service layer, and React components.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Provider enum ────────────────────────────────────────────────────────────

/**
 * Supported media providers.
 * Adding a new provider (e.g. 'r2') only requires:
 *   1. A new Adapter class
 *   2. A new case in MediaService.getUrl()
 *   3. A DB migration to add the value to the CHECK constraint
 */
export type MediaProvider = 'supabase' | 'cloudinary';

// ─── Asset type enum ──────────────────────────────────────────────────────────

export type AssetType = 'team' | 'bts_image' | 'bts_video' | 'logo';

// ─── Core asset record ────────────────────────────────────────────────────────

/**
 * Mirrors the `media_assets` database table.
 * Never stores a raw provider URL — only logical identifiers.
 * URLs are always constructed at runtime by MediaService.
 */
export interface MediaAsset {
  id: string;
  /** Which CDN/storage system holds this file */
  provider: MediaProvider;
  /**
   * Provider-specific identifier:
   *   supabase  → relative storage path  (e.g. "team/ahmed-a1b2c3d4.jpg")
   *   cloudinary → Cloudinary public_id  (e.g. "portfolio/logos/nike-a1b2c3d4")
   */
  provider_id: string;
  /** Logical path — provider-agnostic, used for display/debug */
  path: string;
  asset_type: AssetType;
  width: number | null;
  height: number | null;
  /** File size in bytes */
  file_size: number | null;
  /** MD5 hash of the compressed output buffer (dedup key) */
  content_hash: string;
  alt_text: string;
  /** Base64-encoded LQIP thumbnail (~300–600 bytes). Stored in DB. */
  blur_data_url: string | null;
  created_at: string;
}

// ─── Resolved URL bundle ──────────────────────────────────────────────────────

/**
 * What components actually consume.
 * Returned by MediaService.getUrl().
 */
export interface ResolvedMedia {
  src: string;
  width: number;
  height: number;
  blurDataUrl: string | undefined;
  alt: string;
}

// ─── Upload result ────────────────────────────────────────────────────────────

export interface MediaUploadResult {
  /** The newly created media_assets row id */
  assetId: string;
  /** Resolved public URL (for immediate display without a DB round-trip) */
  url: string;
  /** Whether this was a deduplication hit (file already existed) */
  isDuplicate: boolean;
}
