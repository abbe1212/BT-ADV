/**
 * Media Layer — Public API
 * ─────────────────────────────────────────────────────────────────────────────
 * Single import point for everything in the media layer.
 *
 * Server-side usage (API routes, Server Actions, Server Components):
 *   import { MediaService } from '@/lib/media';
 *   import type { MediaAsset, ResolvedMedia } from '@/lib/media';
 *
 * Client-side usage (only types — no server code):
 *   import type { MediaAsset, ResolvedMedia } from '@/lib/media';
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Types — safe to import anywhere (no runtime code)
export type { MediaAsset, ResolvedMedia, MediaUploadResult, AssetType, MediaProvider } from './types';

// Service — SERVER ONLY
export { MediaService } from './service';
