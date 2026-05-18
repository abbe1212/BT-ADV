/**
 * Image Compression Utilities
 * ─────────────────────────────────────────────────────────────────────────────
 * SERVER-ONLY – uses Sharp. Never import this in client components.
 *
 * Two compression functions:
 *   compressImage() → Converts any image to progressive JPG for Supabase
 *   compressLogo()  → Converts any image/rasterized-SVG to WebP for Cloudinary
 * ─────────────────────────────────────────────────────────────────────────────
 */

import sharp from 'sharp';
import crypto from 'crypto';

export interface CompressionResult {
  buffer: Buffer;
  width: number;
  height: number;
  fileSizeBytes: number;
  contentHash: string; // MD5 of output buffer (first 8 hex chars)
}

// ─── Shared hash helper ───────────────────────────────────────────────────────

function md5Short(buffer: Buffer): string {
  return crypto.createHash('md5').update(buffer).digest('hex').slice(0, 8);
}

// ─── Team images → JPG (full quality) ───────────────────────────────────────

/**
 * Store a team photo at full quality.
 * Only converts to JPG and strips EXIF — no resize, no quality reduction.
 * Team / profile portraits deserve full fidelity.
 *
 * @param buffer - Raw input buffer (any image format)
 */
export async function compressTeamImage(buffer: Buffer): Promise<CompressionResult> {
  const pipeline = sharp(buffer)
    .rotate()                                        // auto-rotate from EXIF
    .jpeg({
      quality: 100,       // full quality — no compression artefacts
      progressive: true,
      mozjpeg: false,     // mozjpeg at q100 is slower with no benefit
    });

  const output = await pipeline.toBuffer({ resolveWithObject: true });

  return {
    buffer: output.data,
    width: output.info.width,
    height: output.info.height,
    fileSizeBytes: output.info.size,
    contentHash: md5Short(output.data),
  };
}

// ─── BTS images → JPG (bandwidth-optimised) ──────────────────────────────────

/**
 * Compress any image to a progressive JPG suitable for Supabase Storage.
 *
 * - Auto-rotates from EXIF orientation
 * - Resizes to max 1920px wide (preserving aspect ratio)
 * - Strips all metadata
 * - Quality 82 — sweet spot between filesize and visual fidelity
 * - mozjpeg: true — better Huffman coding (~10–15% smaller than libjpeg)
 *
 * @param buffer - Raw input buffer (any image format)
 */
export async function compressImage(buffer: Buffer): Promise<CompressionResult> {
  const pipeline = sharp(buffer)
    .rotate()                                        // auto-rotate from EXIF
    .resize({ width: 1920, withoutEnlargement: true })
    .jpeg({
      quality: 82,
      progressive: true,   // progressive scan = faster perceived load
      mozjpeg: true,        // better compression algorithm
    });

  const output = await pipeline.toBuffer({ resolveWithObject: true });

  return {
    buffer: output.data,
    width: output.info.width,
    height: output.info.height,
    fileSizeBytes: output.info.size,
    contentHash: md5Short(output.data),
  };
}

// ─── Client logos → WebP ─────────────────────────────────────────────────────

/**
 * Compress any logo image (including rasterized SVGs) to WebP for Cloudinary.
 *
 * - Resizes to max 400px wide — logos never need larger
 * - WebP quality 85, effort 6 (slower encode, smaller file, done once at upload)
 * - Strips metadata
 *
 * @param buffer - Raw input buffer (PNG, JPG, SVG already rasterized, etc.)
 */
export async function compressLogo(buffer: Buffer): Promise<CompressionResult> {
  const output = await sharp(buffer)
    .rotate()
    .resize({ width: 400, withoutEnlargement: true })
    .webp({ quality: 85, effort: 6 })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: output.data,
    width: output.info.width,
    height: output.info.height,
    fileSizeBytes: output.info.size,
    contentHash: md5Short(output.data),
  };
}
