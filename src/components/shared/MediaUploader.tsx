'use client';

/**
 * MediaUploader — Cloudinary-backed drag-and-drop uploader
 * ─────────────────────────────────────────────────────────────────────────────
 * Flow:
 *  1. User selects / drops a file
 *  2. Client-side validation (type + size)
 *  3. POST multipart/form-data to /api/upload
 *  4. API streams to Cloudinary → returns { url }
 *  5. onUpload(url) is called → caller stores the URL wherever needed
 *
 * Per-entity folder convention:
 *   bt-agency/works    bt-agency/clients   bt-agency/team
 *   bt-agency/bts      bt-agency/reviews   bt-agency/settings
 *
 * Usage:
 *   <MediaUploader
 *     accept="image"
 *     folder="bt-agency/clients"
 *     onUpload={(url) => setValue('logo_url', url)}
 *     onRemove={() => setValue('logo_url', '')}
 *   />
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

/* ─── Types ──────────────────────────────────────────────────────────────────*/

export type MediaAccept = 'image' | 'video' | 'both';

export interface MediaUploaderProps {
  /** Called with the Cloudinary secure URL when upload succeeds */
  onUpload: (url: string) => void;
  /** Restrict allowed media type. Default: 'both' */
  accept?: MediaAccept;
  /**
   * Cloudinary subfolder — use per-entity paths.
   * Examples: 'bt-agency/works', 'bt-agency/clients', 'bt-agency/team', 'bt-agency/bts'
   * Default: 'bt-agency'
   */
  folder?: string;
  /** Pre-existing URL to show as the initial preview */
  defaultUrl?: string;
  /** Label shown inside the drop zone (overrides the default) */
  label?: string;
  /** Show a remove / clear button when a file is uploaded. Default: true */
  allowRemove?: boolean;
  /** Called when the user clears the current upload */
  onRemove?: () => void;
  /** Extra className applied to the root element */
  className?: string;
  /** Disable all interactions */
  disabled?: boolean;
}

interface UploadResponse {
  url: string;
  publicId: string;
  resourceType: string;
  bytes: number;
  width?: number;
  height?: number;
}

/* ─── Validation constants ───────────────────────────────────────────────────*/

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg', 'image/jpg', 'image/png',
  'image/webp', 'image/gif', 'image/avif',
]);

const ALLOWED_VIDEO_TYPES = new Set([
  'video/mp4', 'video/webm', 'video/ogg',
  'video/quicktime', 'video/x-msvideo',
]);

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;  // 10 MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;  // 50 MB

const ACCEPT_ATTR: Record<MediaAccept, string> = {
  image: 'image/jpeg,image/jpg,image/png,image/webp,image/gif,image/avif',
  video: 'video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo',
  both:  'image/jpeg,image/jpg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo',
};

const HINT_TEXT: Record<MediaAccept, string> = {
  image: 'Images · JPEG PNG WebP GIF AVIF · max 10 MB',
  video: 'Videos · MP4 WebM OGG MOV · max 50 MB',
  both:  'Images up to 10 MB · Videos up to 50 MB',
};

/* ─── Client-side file validator ─────────────────────────────────────────────*/

function validateFile(file: File, accept: MediaAccept): string | null {
  const isImage = ALLOWED_IMAGE_TYPES.has(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.has(file.type);

  if (accept === 'image' && !isImage)
    return `Only image files are allowed (JPEG, PNG, WebP, GIF, AVIF). Got: ${file.type}`;
  if (accept === 'video' && !isVideo)
    return `Only video files are allowed (MP4, WebM, OGG, MOV). Got: ${file.type}`;
  if (accept === 'both' && !isImage && !isVideo)
    return `Unsupported file type: ${file.type}`;

  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > maxBytes) {
    const maxMb = maxBytes / 1024 / 1024;
    const sizeMb = (file.size / 1024 / 1024).toFixed(1);
    return `File is too large (${sizeMb} MB). Maximum allowed: ${maxMb} MB`;
  }

  return null; // valid
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov|avi)(\?|$)/i.test(url);
}

/* ─── Component ──────────────────────────────────────────────────────────────*/

export default function MediaUploader({
  onUpload,
  accept = 'both',
  folder = 'bt-agency',
  defaultUrl,
  label,
  allowRemove = true,
  onRemove,
  className = '',
  disabled = false,
}: MediaUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(defaultUrl ?? '');
  const [progress, setProgress]     = useState<number>(0);
  const [uploading, setUploading]   = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef                = useRef<HTMLInputElement>(null);

  /* ── Upload ────────────────────────────────────────────────────────────────*/
  const uploadFile = useCallback(async (file: File) => {
    if (disabled) return;

    // ── Client-side validation (fast, no network) ──────────────────────────
    const validationError = validateFile(file, accept);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      // Animate progress bar while waiting for server
      const tick = setInterval(() => {
        setProgress((p) => Math.min(p + 7, 85));
      }, 300);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(tick);
      setProgress(95);

      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body?.error ?? `Server error (${res.status})`);
      }

      const data: UploadResponse = await res.json();
      setPreviewUrl(data.url);
      setProgress(100);
      onUpload(data.url);
      toast.success('Uploaded successfully!');
      setTimeout(() => setProgress(0), 600);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
      setProgress(0);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [accept, disabled, folder, onUpload]);

  /* ── Drag handlers ─────────────────────────────────────────────────────────*/
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  }, [disabled]);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }, [disabled, uploadFile]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const handleRemove = useCallback(() => {
    setPreviewUrl('');
    setProgress(0);
    onRemove?.();
  }, [onRemove]);

  const openPicker = useCallback(() => {
    if (!disabled && !uploading) fileInputRef.current?.click();
  }, [disabled, uploading]);

  /* ── Render ────────────────────────────────────────────────────────────────*/
  const hasPreview = Boolean(previewUrl);
  const isVideo    = hasPreview && isVideoUrl(previewUrl);

  return (
    <div className={`mu-root ${className}`} style={S.root}>

      {/* ── Drop Zone ────────────────────────────────────────────────────*/}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={label ?? `Upload ${accept === 'image' ? 'image' : accept === 'video' ? 'video' : 'image or video'}`}
        onClick={openPicker}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openPicker()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        style={{
          ...S.zone,
          ...(isDragOver   ? S.zoneActive   : {}),
          ...(hasPreview   ? S.zonePreview  : {}),
          cursor:  disabled ? 'not-allowed' : uploading ? 'wait' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {hasPreview ? (
          /* ── Preview ────────────────────────────────────────────────*/
          <div className="mu-preview-wrap" style={S.previewWrap}>
            {isVideo ? (
              <video src={previewUrl} controls style={S.media} onClick={(e) => e.stopPropagation()} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Uploaded preview" style={S.media} />
            )}
            <div className="mu-overlay" style={S.overlay}>
              <UploadSVG color="#fff" size={20} />
              <span style={S.overlayLabel}>Click to replace</span>
            </div>
          </div>
        ) : (
          /* ── Empty state ────────────────────────────────────────────*/
          <div style={S.empty}>
            <UploadSVG color={isDragOver ? '#FFEE34' : 'rgba(255,255,255,0.3)'} size={38} />
            <p style={S.emptyTitle}>{label ?? `Drop ${accept === 'image' ? 'an image' : accept === 'video' ? 'a video' : 'an image or video'} here`}</p>
            <p style={S.emptyOr}>or <span style={S.emptyBrowse}>browse files</span></p>
            <p style={S.emptyHint}>{HINT_TEXT[accept]}</p>
          </div>
        )}
      </div>

      {/* ── Progress bar ─────────────────────────────────────────────────*/}
      {uploading && (
        <div style={S.progressRow}>
          <div style={S.progressTrack}>
            <div style={{ ...S.progressFill, width: `${progress}%` }} />
          </div>
          <span style={S.progressLabel}>
            {progress < 95 ? 'Uploading…' : 'Processing…'}
          </span>
        </div>
      )}

      {/* ── Remove button ─────────────────────────────────────────────────*/}
      {hasPreview && allowRemove && !uploading && (
        <button type="button" onClick={handleRemove} style={S.removeBtn} aria-label="Remove media">
          <TrashSVG /> Remove
        </button>
      )}

      {/* ── Hidden file input ─────────────────────────────────────────────*/}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_ATTR[accept]}
        onChange={onFileChange}
        style={{ display: 'none' }}
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}

/* ─── Tiny SVG icons ─────────────────────────────────────────────────────────*/

function UploadSVG({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: 'stroke .2s', marginBottom: 10 }} aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function TrashSVG() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ marginRight: 5 }} aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────────*/

const S: Record<string, React.CSSProperties> = {
  root: { display: 'flex', flexDirection: 'column', gap: 8, width: '100%' },
  zone: {
    position: 'relative', display: 'flex', alignItems: 'center',
    justifyContent: 'center', borderRadius: 12, overflow: 'hidden',
    border: '2px dashed rgba(255,255,255,0.13)',
    background: 'rgba(255,255,255,0.025)',
    transition: 'border-color .2s, background .2s', minHeight: 170,
  },
  zoneActive: { borderColor: '#FFEE34', background: 'rgba(255,238,52,0.05)' },
  zonePreview: { border: '2px solid rgba(255,255,255,0.09)', minHeight: 0 },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 20px', textAlign: 'center' },
  emptyTitle: { margin: '0 0 3px', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.65)' },
  emptyOr: { margin: '0 0 6px', fontSize: 12, color: 'rgba(255,255,255,0.35)' },
  emptyBrowse: { color: '#FFEE34', fontWeight: 700, textDecoration: 'underline' },
  emptyHint: { margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.22)' },
  previewWrap: { position: 'relative', width: '100%' },
  media: { width: '100%', display: 'block', maxHeight: 340, objectFit: 'cover', borderRadius: 10 },
  overlay: {
    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.52)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 6, opacity: 0, borderRadius: 10,
    transition: 'opacity .2s',
  },
  overlayLabel: { color: '#fff', fontSize: 12, fontWeight: 600, letterSpacing: '.4px' },
  progressRow: { display: 'flex', alignItems: 'center', gap: 10 },
  progressTrack: { flex: 1, height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg,#FFEE34,#ffe97a)', borderRadius: 99, transition: 'width .3s ease' },
  progressLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' },
  removeBtn: {
    display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start',
    background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.28)',
    borderRadius: 6, color: 'rgba(252,165,165,0.9)', fontSize: 12, fontWeight: 600,
    padding: '4px 11px', cursor: 'pointer', transition: 'background .15s',
  },
};

/* ─── Hover CSS injection (overlay + remove button) ─────────────────────────*/
if (typeof window !== 'undefined') {
  const id = 'mu-hover-styles';
  if (!document.getElementById(id)) {
    const tag = document.createElement('style');
    tag.id = id;
    tag.textContent = `
      .mu-preview-wrap:hover .mu-overlay { opacity: 1 !important; }
      .mu-root button[aria-label="Remove media"]:hover { background: rgba(220,38,38,0.22) !important; }
    `;
    document.head.appendChild(tag);
  }
}
