/**
 * Supabase Storage Utilities
 * Handles file uploads to Supabase Storage buckets.
 */

import { createClient } from './client';

export interface UploadResult {
  url: string | null;
  error: string | null;
}

/**
 * Uploads a file to the given Supabase Storage bucket and returns the public URL.
 * The bucket must be set to public in the Supabase dashboard.
 *
 * @param bucket - The storage bucket name (e.g. 'works', 'team')
 * @param file - The File object selected by the user
 * @param folder - Optional sub-folder path (e.g. 'thumbnails')
 */
export async function uploadFile(
  bucket: string,
  file: File,
  folder?: string
): Promise<UploadResult> {
  const supabase = createClient();

  // Generate a collision-resistant file name
  const ext = file.name.split('.').pop();
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).slice(2, 8);
  const fileName = folder
    ? `${folder}/${timestamp}-${randomPart}.${ext}`
    : `${timestamp}-${randomPart}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('[uploadFile]', uploadError.message);
    return { url: null, error: uploadError.message };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return { url: data.publicUrl, error: null };
}
