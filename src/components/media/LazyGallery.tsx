'use client';

/**
 * LazyGallery — Intersection Observer–based progressive gallery
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders a gallery of MediaAsset images in progressive batches.
 * Only the first batch is rendered immediately; more load as the user scrolls.
 *
 * - Initial batch: 6 items
 * - Loads 6 more each time the sentinel enters the viewport
 * - 200px root margin for smooth ahead-of-time loading
 * - Masonry-style columns layout by default
 *
 * Usage:
 *   <LazyGallery assets={btsImages} columns={3} />
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useRef, useState, useEffect } from 'react';
import { LazyImage } from './LazyImage';
import type { MediaAsset } from '@/lib/media/types';

interface LazyGalleryProps {
  assets: MediaAsset[];
  /** Number of columns. Default: 3 */
  columns?: number;
  /** Images to render in the first batch. Default: 6 */
  initialCount?: number;
  /** Number of images to add per scroll trigger. Default: 6 */
  batchSize?: number;
  className?: string;
}

export function LazyGallery({
  assets,
  columns = 3,
  initialCount = 6,
  batchSize = 6,
  className = '',
}: LazyGalleryProps) {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const hasMore = visibleCount < assets.length;

  useEffect(() => {
    if (!hasMore) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + batchSize, assets.length));
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, batchSize, assets.length]);

  const visible = assets.slice(0, visibleCount);

  return (
    <div className={className}>
      <div
        style={{
          columns,
          columnGap: '1rem',
        }}
      >
        {visible.map((asset, index) => (
          <div
            key={asset.id}
            style={{ breakInside: 'avoid', marginBottom: '1rem' }}
          >
            <LazyImage
              asset={asset}
              width={640}
              height={480}
              // Only the very first image gets priority (above the fold)
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {/* Sentinel element — triggers next batch when scrolled into view */}
      {hasMore && (
        <div
          ref={sentinelRef}
          aria-hidden="true"
          style={{ height: 1 }}
        />
      )}
    </div>
  );
}
