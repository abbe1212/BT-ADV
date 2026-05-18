'use client';

/**
 * LazyVideo — Intersection Observer–based lazy video loader
 * ─────────────────────────────────────────────────────────────────────────────
 * NEVER sets src on the <video> element until the player is near the viewport.
 * This prevents the browser from downloading 1MB+ video files for off-screen
 * BTS clips.
 *
 * Behaviour:
 *   - Shows a poster image (blur placeholder from DB) while off-screen
 *   - Triggers load when element enters +300px root margin
 *   - Once loaded, disconnects the observer (no re-triggering)
 *   - preload="none" — browser never buffers data automatically
 *
 * Usage:
 *   <LazyVideo asset={btsVideoAsset} />
 *   <LazyVideo asset={btsVideoAsset} className="rounded-xl" />
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useRef, useEffect, useState } from 'react';
import { MediaService } from '@/lib/media/service';
import type { MediaAsset } from '@/lib/media/types';

interface LazyVideoProps {
  asset: MediaAsset;
  className?: string;
  /** Show native browser controls. Default: true */
  controls?: boolean;
  /** Autoplay when entering viewport (muted required for autoplay). Default: false */
  autoPlay?: boolean;
  /** Loop video. Default: false */
  loop?: boolean;
}

export function LazyVideo({
  asset,
  className = '',
  controls = true,
  autoPlay = false,
  loop = false,
}: LazyVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef     = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  const { src } = MediaService.getUrl(asset);
  // Use blur_data_url as a static poster (base64 JPEG)
  const poster = asset.blur_data_url ?? undefined;

  // Intersection Observer — trigger load 300px before entering viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect(); // fire once only
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // If autoPlay, start playing once src is set
  useEffect(() => {
    if (shouldLoad && autoPlay && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay may be blocked by browser policy — safe to ignore
      });
    }
  }, [shouldLoad, autoPlay]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', width: '100%' }}
    >
      <video
        ref={videoRef}
        // Only assign src once near viewport — prevents any pre-download
        src={shouldLoad ? src : undefined}
        poster={poster}
        controls={controls}
        preload="none"        // CRITICAL: never preload video data
        playsInline           // Required for iOS inline playback
        muted={autoPlay}      // muted required for browser autoplay policy
        loop={loop}
        aria-label={asset.alt_text || 'BTS video'}
        style={{ width: '100%', display: 'block', borderRadius: 'inherit' }}
      />
    </div>
  );
}
