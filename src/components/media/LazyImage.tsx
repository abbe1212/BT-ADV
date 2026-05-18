'use client';

/**
 * LazyImage — Optimised lazy-loading image component
 * ─────────────────────────────────────────────────────────────────────────────
 * Wraps Next.js <Image> with:
 *   - Native browser lazy loading (loading="lazy")
 *   - LQIP blur placeholder from the DB (no extra HTTP request)
 *   - Responsive sizes hint
 *   - Fade-in animation once loaded
 *
 * Usage:
 *   <LazyImage asset={mediaAsset} width={640} height={480} />
 *   <LazyImage asset={mediaAsset} width={640} height={480} priority />  ← above fold only
 * ─────────────────────────────────────────────────────────────────────────────
 */

import Image from 'next/image';
import { useState } from 'react';
import { MediaService } from '@/lib/media/service';
import type { MediaAsset } from '@/lib/media/types';

interface LazyImageProps {
  asset: MediaAsset;
  /** Rendered width in px — also used to pick the right srcSet entry */
  width: number;
  /** Rendered height in px */
  height: number;
  /** Override alt text (falls back to asset.alt_text) */
  alt?: string;
  /**
   * Set true ONLY for above-the-fold images (hero, first visible card).
   * Disables lazy loading and sets fetchpriority="high".
   * Default: false
   */
  priority?: boolean;
  className?: string;
  /** Tailwind/CSS sizes hint, defaults to responsive 3-column grid */
  sizes?: string;
}

export function LazyImage({
  asset,
  width,
  height,
  alt,
  priority = false,
  className = '',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);

  const { src, blurDataUrl, alt: assetAlt } = MediaService.getUrl(asset, width);

  return (
    <span
      style={{ display: 'block', position: 'relative', overflow: 'hidden' }}
      className={className}
    >
      <Image
        src={src}
        alt={alt ?? assetAlt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        priority={priority}
        placeholder={blurDataUrl ? 'blur' : 'empty'}
        blurDataURL={blurDataUrl}
        sizes={sizes}
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          // Fade in once loaded — prevents layout shift flash
          opacity: loaded || priority ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      />
    </span>
  );
}
