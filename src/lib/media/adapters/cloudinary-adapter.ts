/**
 * Cloudinary Adapter
 * ─────────────────────────────────────────────────────────────────────────────
 * SERVER-ONLY. Wraps the Cloudinary Node SDK for the media layer.
 *
 * Responsibilities:
 *   - Upload WebP logo buffers to Cloudinary
 *   - Construct delivery URLs (with optional width resize)
 *   - Delete assets by public_id
 *
 * Folder structure in Cloudinary:
 *   portfolio/logos/{client-slug}-{hash}   (no extension — Cloudinary handles it)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { v2 as cloudinary } from 'cloudinary';

// Configure once on module load (lazy singleton)
let configured = false;

function ensureConfigured() {
  if (configured) return;

  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      '[CloudinaryAdapter] Missing env vars: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET'
    );
  }

  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
  configured = true;
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export interface CloudinaryUploadOptions {
  /**
   * Cloudinary public_id (no extension, no folder prefix).
   * e.g. "nike-a1b2c3d4"
   * Will be uploaded under: portfolio/logos/{publicId}
   */
  publicId: string;
}

export interface CloudinaryUploadResult {
  /** Full Cloudinary public_id including folder. e.g. "portfolio/logos/nike-a1b2c3d4" */
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Upload a WebP logo buffer to Cloudinary.
 * Uses stream upload (no temp files).
 * Throws on failure.
 */
export async function cloudinaryUpload(
  buffer: Buffer,
  options: CloudinaryUploadOptions
): Promise<CloudinaryUploadResult> {
  ensureConfigured();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'portfolio/logos',
        public_id: options.publicId,
        format: 'webp',       // enforce WebP — even if buffer is already WebP
        overwrite: false,     // content-addressed names: never re-upload same file
        resource_type: 'image',
        tags: ['logo', 'client', 'portfolio'],
      },
      (error, result) => {
        if (error) return reject(new Error(`[CloudinaryAdapter] ${error.message}`));
        if (!result) return reject(new Error('[CloudinaryAdapter] No result returned'));

        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
        });
      }
    );

    stream.end(buffer);
  });
}

// ─── URL construction ─────────────────────────────────────────────────────────

/**
 * Build a Cloudinary delivery URL for a logo.
 * Auto quality + WebP format. Optionally resize to a specific width.
 *
 * @param publicId - Full Cloudinary public_id (e.g. "portfolio/logos/nike-a1b2")
 * @param width    - Optional target width in pixels (uses c_limit so no upscale)
 */
export function cloudinaryGetUrl(publicId: string, width?: number): string {
  ensureConfigured();

  return cloudinary.url(publicId, {
    secure: true,
    format: 'webp',
    quality: 'auto',
    fetch_format: 'auto',
    ...(width ? { width, crop: 'limit' } : {}),
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Delete a Cloudinary asset by its full public_id.
 * Silently ignores "not found" responses.
 */
export async function cloudinaryDelete(publicId: string): Promise<void> {
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
}
