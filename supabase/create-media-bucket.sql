-- ─────────────────────────────────────────────────────────────────────────────
-- Fix: Create "media" Supabase Storage bucket
-- ─────────────────────────────────────────────────────────────────────────────
-- Run this in: Supabase Dashboard → SQL Editor
--
-- Why: The storage.buckets INSERT in the main migration may fail silently
-- if the Supabase project version doesn't allow direct INSERT into storage schema
-- via SQL Editor. Use this as a fix/fallback.
-- ─────────────────────────────────────────────────────────────────────────────

-- Step 1: Create the bucket (safe to re-run — ON CONFLICT DO NOTHING)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  104857600,   -- 100 MB limit per file
  ARRAY[
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
    'image/avif', 'image/bmp', 'image/tiff', 'image/heic', 'image/heif',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public           = true,
  file_size_limit  = 104857600,
  allowed_mime_types = ARRAY[
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
    'image/avif', 'image/bmp', 'image/tiff', 'image/heic', 'image/heif',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'
  ];

-- Step 2: Public read policy (anyone can view uploaded media)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
      AND policyname = 'media bucket: public read'
  ) THEN
    CREATE POLICY "media bucket: public read"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'media');
  END IF;
END $$;

-- Step 3: Admin upload policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
      AND policyname = 'media bucket: admin upload'
  ) THEN
    CREATE POLICY "media bucket: admin upload"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'media'
        AND EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
      );
  END IF;
END $$;

-- Step 4: Admin delete policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
      AND policyname = 'media bucket: admin delete'
  ) THEN
    CREATE POLICY "media bucket: admin delete"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'media'
        AND EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
      );
  END IF;
END $$;

-- ─── Verify ───────────────────────────────────────────────────────────────────
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE id = 'media';
