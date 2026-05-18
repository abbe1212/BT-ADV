/**
 * POST /api/upload/logo
 * ─────────────────────────────────────────────────────────────────────────────
 * Accepts a multipart/form-data upload, compresses to WebP, uploads to
 * Cloudinary, and creates a `media_assets` record in the DB.
 *
 * Form fields:
 *   file         (required) — logo file (PNG, JPG, WebP — NOT raw SVG)
 *   client_slug  (required) — URL-safe client name (e.g. "pepsico")
 *   alt_text     (optional) — accessibility description
 *
 * Returns:
 *   { assetId, url, isDuplicate }
 *
 * Note on SVG: SVG files must be rasterized client-side (Canvas API) before
 * posting here. Raw SVG cannot be processed by Sharp without libvips SVG support.
 *
 * Security: requires authenticated admin session + valid CSRF token.
 * Rate limit: 20 uploads per IP per 10 minutes.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextResponse } from 'next/server';
import { MediaService } from '@/lib/media/service';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { verifyCsrfToken } from '@/lib/csrf';
import { requireAdmin } from '@/lib/supabase/admin-auth';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
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
  const rl = await rateLimit(`upload-logo:${ip}`, { limit: 20, windowMs: 10 * 60 * 1_000 });
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

  const file        = formData.get('file');
  const clientSlug  = formData.get('client_slug') as string | null;
  const altText     = (formData.get('alt_text')   as string | null) ?? '';

  /* ── Validate fields ─────────────────────────────────────────────────────*/
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Missing required field: file.' }, { status: 400 });
  }

  if (!clientSlug || clientSlug.trim().length === 0) {
    return NextResponse.json({ error: 'Missing required field: client_slug.' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      {
        error: `Unsupported file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(', ')}. Note: SVG must be rasterized before upload.`,
      },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024} MB.` },
      { status: 413 }
    );
  }

  /* ── Process & upload ────────────────────────────────────────────────────*/
  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await MediaService.uploadLogo(
      buffer,
      clientSlug.trim(),
      altText.trim()
    );

    return NextResponse.json(result, { status: result.isDuplicate ? 200 : 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[POST /api/upload/logo]', message);
    return NextResponse.json({ error: 'Logo upload failed.', details: message }, { status: 500 });
  }
}

export const maxDuration = 30;
