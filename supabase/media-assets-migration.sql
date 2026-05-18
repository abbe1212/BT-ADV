-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: media_assets table
-- ─────────────────────────────────────────────────────────────────────────────
-- Run this in: Supabase Dashboard → SQL Editor
--
-- What this does:
--   1. Creates the `media_assets` table (provider-agnostic media registry)
--   2. Enables RLS with safe read/write policies
--   3. Creates a "media" storage bucket (public read, admin write)
--   4. Sets storage bucket policies
--
-- IMPORTANT: Run sections one at a time if you want to inspect results.
-- ─────────────────────────────────────────────────────────────────────────────


-- ── 1. media_assets table ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.media_assets (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Which storage system holds this file
  provider       TEXT        NOT NULL
                             CHECK (provider IN ('supabase', 'cloudinary')),

  -- Provider-specific identifier (NOT a full URL):
  --   supabase   → relative storage path  e.g. "team/ahmed-a1b2c3d4.jpg"
  --   cloudinary → Cloudinary public_id   e.g. "portfolio/logos/nike-a1b2c3d4"
  provider_id    TEXT        NOT NULL,

  -- Logical, human-readable path (provider-agnostic, used for display/debug)
  path           TEXT        NOT NULL,

  -- Asset category
  asset_type     TEXT        NOT NULL
                             CHECK (asset_type IN ('team', 'bts_image', 'bts_video', 'logo')),

  -- Image dimensions (NULL for videos where dims are less critical)
  width          INTEGER,
  height         INTEGER,

  -- Compressed file size in bytes
  file_size      INTEGER,

  -- MD5 of the compressed output buffer (first 8 hex chars).
  -- Used as deduplication key — prevents re-uploading the same file.
  content_hash   TEXT        NOT NULL,

  -- Accessibility description
  alt_text       TEXT        NOT NULL DEFAULT '',

  -- Base64 LQIP thumbnail (~300–700 bytes).
  -- Stored here so Next.js blurDataURL works with zero extra HTTP requests.
  blur_data_url  TEXT,

  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Deduplication constraint: same provider + same content hash = same file
  UNIQUE (provider, content_hash)
);

-- Auto-update updated_at on every row update
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_media_assets_updated_at ON public.media_assets;
CREATE TRIGGER trg_media_assets_updated_at
  BEFORE UPDATE ON public.media_assets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_media_assets_type     ON public.media_assets (asset_type);
CREATE INDEX IF NOT EXISTS idx_media_assets_provider ON public.media_assets (provider);
CREATE INDEX IF NOT EXISTS idx_media_assets_hash     ON public.media_assets (content_hash);


-- ── 2. Row Level Security ─────────────────────────────────────────────────────

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- Public can read all assets (needed for client-side URL resolution)
CREATE POLICY "media_assets: public read"
  ON public.media_assets
  FOR SELECT
  USING (true);

-- Only authenticated admins can insert / update / delete
CREATE POLICY "media_assets: admin write"
  ON public.media_assets
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );


-- ── 3. Supabase Storage bucket ────────────────────────────────────────────────
-- Creates the "media" bucket if it does not already exist.
-- Run this ONCE — safe to re-run (INSERT ... ON CONFLICT DO NOTHING).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,                      -- public: anyone can GET objects via public URL
  15728640,                  -- 15 MB max upload size
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/bmp',
    'image/tiff',
    'image/heic',
    'image/heif',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
)
ON CONFLICT (id) DO NOTHING;


-- ── 4. Storage bucket policies ────────────────────────────────────────────────

-- Public read: anyone can download files from the media bucket
CREATE POLICY "media bucket: public read"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'media');

-- Admin write: only admins can upload, update, delete
CREATE POLICY "media bucket: admin upload"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'media'
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "media bucket: admin update"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'media'
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "media bucket: admin delete"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'media'
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );


-- ── 5. Verification queries (run after migration to confirm) ──────────────────

-- Check table structure
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'media_assets'
-- ORDER BY ordinal_position;

-- Check RLS policies
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'media_assets';

-- Check bucket
-- SELECT id, name, public FROM storage.buckets WHERE id = 'media';
