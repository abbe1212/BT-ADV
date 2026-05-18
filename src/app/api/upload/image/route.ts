/**
 * POST /api/upload/image
 * ─────────────────────────────────────────────────────────────────────────────
 * Accepts a multipart/form-data upload and stores the compressed JPG in
 * Supabase Storage, then creates a `media_assets` record in the DB.
 *
 * Form fields:
 *   file       (required) — image file (any format: JPG, PNG, HEIC, etc.)
 *   asset_type (required) — "team" | "bts_image"
 *   slug       (required) — URL-safe name for the filename base (e.g. "ahmed-khalil")
 *   alt_text   (optional) — accessibility description
 *
 * Returns:
 *   { assetId, url, isDuplicate }
 *
 * Security: requires authenticated admin session + valid CSRF token.
 * Rate limit: 30 uploads per IP per 10 minutes.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextResponse } from 'next/server';
import { MediaService } from '@/lib/media/service';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { verifyCsrfToken } from '@/lib/csrf';
import { requireAdmin } from '@/lib/supabase/admin-auth';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB — pre-compression input

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/heic',
  'image/heif',
  'image/tiff',
  'image/bmp',
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
  const rl = await rateLimit(`upload-image:${ip}`, { limit: 30, windowMs: 10 * 60 * 1_000 });
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

  const file      = formData.get('file');
  const assetType = formData.get('asset_type') as string | null;
  const slug      = formData.get('slug')       as string | null;
  const altText   = (formData.get('alt_text')  as string | null) ?? '';

  /* ── Validate fields ─────────────────────────────────────────────────────*/
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Missing required field: file.' }, { status: 400 });
  }

  if (!assetType || !['team', 'bts_image'].includes(assetType)) {
    return NextResponse.json(
      { error: 'Invalid asset_type. Must be "team" or "bts_image".' },
      { status: 400 }
    );
  }

  if (!slug || slug.trim().length === 0) {
    return NextResponse.json({ error: 'Missing required field: slug.' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(', ')}` },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File too large. Maximum input size is ${MAX_FILE_SIZE / 1024 / 1024} MB.` },
      { status: 413 }
    );
  }

  /* ── Process & upload ────────────────────────────────────────────────────*/
  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await MediaService.uploadImage(
      buffer,
      assetType as 'team' | 'bts_image',
      slug.trim(),
      altText.trim()
    );

    return NextResponse.json(result, { status: result.isDuplicate ? 200 : 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[POST /api/upload/image]', message);
    return NextResponse.json({ error: 'Upload failed.', details: message }, { status: 500 });
  }
}

// Allow up to 60s for large uploads on Vercel hobby plan
export const maxDuration = 60;
