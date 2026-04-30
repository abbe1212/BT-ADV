import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

/* ─── Config ─────────────────────────────────────────────────────────────────*/

/** 50 MB limit for videos, 10 MB for images */
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-msvideo',
];

const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

/* ─── POST /api/upload ───────────────────────────────────────────────────────*/
/**
 * Accepts multipart/form-data with the following fields:
 *   - file     (required) — the image or video file
 *   - folder   (optional) — Cloudinary subfolder, e.g. 'bt-agency/works'
 *
 * Returns:
 *   { url: string, publicId: string, resourceType: string, bytes: number }
 *
 * The caller is responsible for persisting the returned `url` to Supabase
 * via the appropriate Server Action (e.g. works.ts, clients.ts, bts.ts).
 *
 * Rate limit: 20 uploads per IP per 10 minutes.
 */
export async function POST(req: Request) {
  try {
    /* ── Rate limiting ──────────────────────────────────────────────────────*/
    const ip = getClientIp(req);
    const rl = await rateLimit(`upload:${ip}`, { limit: 20, windowMs: 10 * 60 * 1_000 });
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many uploads. Please wait before trying again.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      );
    }

    /* ── Parse multipart form ───────────────────────────────────────────────*/
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { error: 'Request must be multipart/form-data.' },
        { status: 400 }
      );
    }

    const file = formData.get('file');
    const folder = (formData.get('folder') as string | null) ?? 'bt-agency';

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Missing required field: file.' },
        { status: 400 }
      );
    }

    /* ── Validate file type ─────────────────────────────────────────────────*/
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${file.type}. Allowed: images (jpeg, png, webp, gif, avif) and videos (mp4, webm, ogg, mov, avi).`,
        },
        { status: 400 }
      );
    }

    /* ── Validate file size ─────────────────────────────────────────────────*/
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB.`,
        },
        { status: 413 }
      );
    }

    /* ── Upload to Cloudinary ───────────────────────────────────────────────*/
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadToCloudinary(buffer, {
      folder,
      resourceType: 'auto', // Cloudinary detects image vs video automatically
    });

    /* ── Return Cloudinary URL to caller ────────────────────────────────────*/
    // The caller (Server Action or client) persists the URL wherever needed.
    return NextResponse.json({
      url:          result.secureUrl,
      publicId:     result.publicId,
      resourceType: result.resourceType,
      format:       result.format,
      bytes:        result.bytes,
      width:        result.width,
      height:       result.height,
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[POST /api/upload] unexpected:', message);
    return NextResponse.json(
      { error: 'Upload failed.', details: message },
      { status: 500 }
    );
  }
}

/* ─── Route Segment Config (App Router) ─────────────────────────────────────*/
// Allow up to 60 s for large video uploads (Vercel hobby plan max is 60 s).
export const maxDuration = 60;

