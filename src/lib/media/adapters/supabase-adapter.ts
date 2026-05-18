/**
 * Supabase Storage Adapter
 * ─────────────────────────────────────────────────────────────────────────────
 * SERVER-ONLY. Wraps Supabase Storage for the media layer.
 *
 * Responsibilities:
 *   - Upload compressed image/video buffers
 *   - Construct public CDN URLs from storage paths
 *   - Delete files by path
 *
 * Bucket name: "media" (must be created as PUBLIC in Supabase dashboard)
 * Bucket structure:
 *   media/
 *     team/{slug}-{hash}.jpg
 *     bts/images/{slug}-{n}-{hash}.jpg
 *     bts/videos/{slug}-{n}-{hash}.mp4
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js';

const BUCKET = 'media';

// Use service role key for uploads (bypasses RLS for storage operations).
// This client is only ever instantiated on the server.
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    throw new Error(
      '[SupabaseAdapter] Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY'
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export interface SupabaseUploadOptions {
  /** Storage path relative to bucket root. e.g. "team/ahmed-a1b2.jpg" */
  path: string;
  /** Buffer of the ALREADY-COMPRESSED file */
  buffer: Buffer;
  mimeType: 'image/jpeg' | 'image/webp' | 'video/mp4';
}

/**
 * Upload a buffer to Supabase Storage.
 * Returns the relative storage path (same as options.path).
 * Throws on failure.
 */
export async function supabaseUpload(options: SupabaseUploadOptions): Promise<string> {
  const { path, buffer, mimeType } = options;
  const supabase = getAdminClient();

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: mimeType,
    // Content-addressed names = safe to cache forever
    cacheControl: '31536000',
    upsert: false, // never overwrite — dedup prevents re-uploads anyway
  });

  if (error) {
    // "already exists" (23505 / 409) can happen in race conditions — treat as success
    if (error.message?.includes('already exists') || (error as { statusCode?: string }).statusCode === '409') {
      return path;
    }
    // Give a clear, actionable message for the most common failure
    if (error.message?.includes('Bucket not found') || (error as { statusCode?: string }).statusCode === '404') {
      throw new Error(
        '[SupabaseAdapter] The "media" storage bucket does not exist. ' +
        'Go to Supabase Dashboard → Storage → New Bucket → name it "media" → set Public → Save. ' +
        'Or run supabase/create-media-bucket.sql in the SQL Editor.'
      );
    }
    throw new Error(`[SupabaseAdapter] Upload failed: ${error.message}`);
  }

  return path;
}

// ─── Public URL ───────────────────────────────────────────────────────────────

/**
 * Construct the public URL for a file in the media bucket.
 * Does NOT make a network request — purely string construction.
 *
 * @param path - Relative storage path returned by supabaseUpload()
 */
export function supabaseGetUrl(path: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error('[SupabaseAdapter] Missing NEXT_PUBLIC_SUPABASE_URL');
  // Supabase public URL pattern
  return `${url}/storage/v1/object/public/${BUCKET}/${path}`;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Delete a file from Supabase Storage by its relative path.
 * Silently succeeds if the file doesn't exist.
 */
export async function supabaseDelete(path: string): Promise<void> {
  const supabase = getAdminClient();
  await supabase.storage.from(BUCKET).remove([path]);
}
