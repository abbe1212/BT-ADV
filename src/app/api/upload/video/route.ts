/**
 * POST /api/upload/video
 * ─────────────────────────────────────────────────────────────────────────────
 * Accepts a multipart/form-data video upload and stores it in Supabase Storage,
 * then creates a `media_assets` record in the DB.
 *
 * Form fields:
 *   file      (required) — MP4 / WebM / MOV video file
 *   slug      (optional) — filename base slug; auto-derived from filename if omitted
 *   alt_text  (optional) — accessibility description
 *
 * Returns:
 *   { assetId, url, isDuplicate }
 *
 * Security: requires authenticated admin session + valid CSRF token.
 * Rate limit: 10 uploads per IP per 10 minutes (videos are large).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextResponse } from 'next/server';
import { MediaService } from '@/lib/media/service';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { verifyCsrfToken } from '@/lib/csrf';
import { requireAdmin } from '@/lib/supabase/admin-auth';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

const ALLOWED_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-msvideo',
];

export async function POST(req: Request) {
  /* ── [P0.1] CSRF verification ──────────────────────────────────────────────*/
  if (!verifyCsrfToken(req)) {
    return NextResponse.json(
      { error: 'Invalid or missing CSRF token.' },
      { status: 403 }
    );
  }

  /* ── [P0.1] Admin authentication ───────────────────────────────────────────*/
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  /* ── Rate limiting ───────────────────────────────────────────────────────*/
  const ip = getClientIp(req);
  const rl = await rateLimit(`upload-video:${ip}`, { limit: 10, windowMs: 10 * 60 * 1_000 });
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many uploads. Please wait before trying again.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    );
  }

  /* ── Parse form ──────────────────────────────────────────────────────────*/
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Request must be multipart/form-data.' }, { status: 400 });
  }

  const file    = formData.get('file');
  const altText = (formData.get('alt_text') as string | null) ?? '';

  // Derive slug from provided value or filename
  let slug = (formData.get('slug') as string | null)?.trim() ?? '';
  if (!slug && file instanceof File) {
    slug = file.name.replace(/\.[^.]+$/, ''); // strip extension
  }
  if (!slug) slug = 'bts-video';

  /* ── Validate ─────────────────────────────────────────────────────────────*/
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Missing required field: file.' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `Unsupported type: ${file.type}. Allowed: MP4, WebM, OGG, MOV.` },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024} MB.` },
      { status: 413 }
    );
  }

  /* ── Upload ───────────────────────────────────────────────────────────────*/
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await MediaService.uploadVideo(buffer, slug, altText.trim());
    return NextResponse.json(result, { status: result.isDuplicate ? 200 : 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[POST /api/upload/video]', message);
    return NextResponse.json({ error: 'Video upload failed.', details: message }, { status: 500 });
  }
}

// Allow up to 120s for large video uploads
export const maxDuration = 120;
