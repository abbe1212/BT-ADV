/**
 * Supabase Storage Utilities
 * ─────────────────────────────────────────────────────────────────────────────
 * Two upload strategies:
 *
 *  uploadFile()        → public bucket  → returns a permanent public URL.
 *                        Use for: portfolio images, team photos, logos.
 *
 *  uploadPrivateFile() → private bucket → returns only the storage path.
 *                        Use for: company briefs, brand guides, contracts.
 *                        Serve these with getSignedUrl() — never a public URL.
 *
 *  getSignedUrl()      → generates a short-lived signed URL for a private file.
 *                        Default TTL: 1 hour. Pass expiresIn (seconds) to override.
 */

import { createClient } from './client';

export interface UploadResult {
  url: string | null;
  error: string | null;
}

export interface PrivateUploadResult {
  /** Storage path relative to the bucket root (e.g. "briefs/1715000000-abc123.pdf"). */
  path: string | null;
  error: string | null;
}

export interface SignedUrlResult {
  signedUrl: string | null;
  error: string | null;
}

// ─── Shared file-name generator ───────────────────────────────────────────────

function buildFileName(file: File, folder?: string): string {
  const ext = file.name.split('.').pop();
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).slice(2, 8);
  return folder
    ? `${folder}/${timestamp}-${randomPart}.${ext}`
    : `${timestamp}-${randomPart}.${ext}`;
}

// ─── Public bucket upload ─────────────────────────────────────────────────────

/**
 * Uploads a file to a PUBLIC bucket and returns its permanent public URL.
 * The bucket must be set to "public" in the Supabase dashboard.
 *
 * Use for: portfolio images, team photos, client logos, BTS media.
 */
export async function uploadFile(
  bucket: string,
  file: File,
  folder?: string
): Promise<UploadResult> {
  const supabase = createClient();
  const fileName = buildFileName(file, folder);

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, { cacheControl: '3600', upsert: false });

  if (uploadError) {
    console.error('[uploadFile]', uploadError.message);
    return { url: null, error: uploadError.message };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return { url: data.publicUrl, error: null };
}

// ─── Private bucket upload ────────────────────────────────────────────────────

/**
 * Uploads a file to a PRIVATE bucket and returns the storage path.
 * No public URL is generated — use getSignedUrl() to serve the file.
 *
 * The bucket must be set to "private" (RLS: only authenticated admins can read).
 *
 * Use for: company briefs, brand guides, contracts, sensitive documents.
 */
export async function uploadPrivateFile(
  bucket: string,
  file: File,
  folder?: string
): Promise<PrivateUploadResult> {
  const supabase = createClient();
  const path = buildFileName(file, folder);

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (uploadError) {
    console.error('[uploadPrivateFile]', uploadError.message);
    return { path: null, error: uploadError.message };
  }

  return { path, error: null };
}

// ─── Signed URL generator ─────────────────────────────────────────────────────

/**
 * Generates a short-lived signed URL for a file in a PRIVATE bucket.
 *
 * @param bucket    - The private bucket name.
 * @param path      - The storage path returned by uploadPrivateFile().
 * @param expiresIn - URL lifetime in seconds (default: 3600 = 1 hour).
 *
 * Signed URLs expire automatically — a new one must be requested per session.
 * This prevents permanent public exposure of sensitive files.
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn = 3_600
): Promise<SignedUrlResult> {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error('[getSignedUrl]', error.message);
    return { signedUrl: null, error: error.message };
  }

  return { signedUrl: data.signedUrl, error: null };
}

