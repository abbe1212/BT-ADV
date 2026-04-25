'use client';

/**
 * ImageUploadInput — Cloudinary-backed image uploader
 * ─────────────────────────────────────────────────────────────────────────────
 * Previously uploaded to Supabase Storage. Now routes through /api/upload
 * which signs and uploads to Cloudinary, returning a CDN secure_url.
 *
 * The `bucket` and `folder` props are unified into a single `folder` prop
 * that maps to a Cloudinary subfolder (e.g. 'bt-agency/works').
 *
 * Old:  uploadFile(bucket, file, folder)       → Supabase Storage URL
 * New:  POST /api/upload { file, folder }       → Cloudinary CDN URL
 *
 * The API signature for callers is unchanged:
 *   value:    string   — current image URL
 *   onChange: (url) => void — called with the new Cloudinary URL
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Link } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

/* ─── Validation ─────────────────────────────────────────────────────────────*/

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg', 'image/jpg', 'image/png',
  'image/webp', 'image/gif', 'image/avif',
]);
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

/* ─── Props ──────────────────────────────────────────────────────────────────*/

interface ImageUploadInputProps {
  /** Current image URL value (used to display preview) */
  value: string;
  /** Called with the new Cloudinary URL when upload succeeds, or when URL is typed */
  onChange: (url: string) => void;
  /**
   * Cloudinary subfolder. Maps to the `folder` field in POST /api/upload.
   * Convention: 'bt-agency/<entity>', e.g. 'bt-agency/works', 'bt-agency/clients'.
   * @deprecated Use the `folder` prop directly. `bucket` is ignored (Supabase artifact).
   */
  bucket?: string;
  /** Cloudinary subfolder override. Takes precedence over `bucket`. */
  folder?: string;
  /** Placeholder for the URL input fallback */
  placeholder?: string;
  /** Label shown above the component */
  label?: string;
  /** Mark as required */
  required?: boolean;
}

/* ─── Component ──────────────────────────────────────────────────────────────*/

export function ImageUploadInput({
  value,
  onChange,
  bucket,
  folder,
  placeholder = 'https://',
  label,
  required = false,
}: ImageUploadInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging]   = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [mode, setMode]               = useState<'upload' | 'url'>('upload');

  // Resolve folder: explicit folder > legacy bucket > fallback
  const resolvedFolder = folder ?? (bucket ? `bt-agency/${bucket}` : 'bt-agency/works');

  const handleFile = useCallback(
    async (file: File) => {
      // ── Client-side validation ─────────────────────────────────────────
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        toast.error(`Unsupported file type: ${file.type}. Use JPEG, PNG, WebP, GIF, or AVIF.`);
        return;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        const mb = (file.size / 1024 / 1024).toFixed(1);
        toast.error(`Image too large (${mb} MB). Maximum: 10 MB`);
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', resolvedFolder);

        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) {
          const body = await res.json().catch(() => ({})) as { error?: string };
          throw new Error(body?.error ?? `Upload failed (${res.status})`);
        }
        const data = await res.json() as { url: string };
        onChange(data.url);
        toast.success('Image uploaded successfully');
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [resolvedFolder, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearImage = () => onChange('');

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-bold text-white">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      {/* Mode toggle */}
      <div className="flex gap-1 bg-[#061520] border border-[#14304A] rounded-lg p-1 w-fit">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`px-3 py-1 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 ${
            mode === 'upload' ? 'bg-[#FFEE34] text-[#00203C]' : 'text-white/50 hover:text-white'
          }`}
        >
          <Upload className="w-3 h-3" />Upload
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`px-3 py-1 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 ${
            mode === 'url' ? 'bg-[#FFEE34] text-[#00203C]' : 'text-white/50 hover:text-white'
          }`}
        >
          <Link className="w-3 h-3" />URL
        </button>
      </div>

      {mode === 'upload' ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative w-full border-2 border-dashed rounded-xl transition-all cursor-pointer group ${
            isDragging
              ? 'border-[#FFEE34] bg-[#FFEE34]/5'
              : 'border-[#14304A] hover:border-[#FFEE34]/50 hover:bg-[#FFEE34]/5'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/avif"
            className="hidden"
            onChange={handleFileInputChange}
          />

          {value ? (
            /* Preview */
            <div className="relative aspect-video w-full overflow-hidden rounded-xl">
              <Image src={value} alt="Preview" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Click or drag to replace
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); clearImage(); }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Empty / uploading state */
            <div className="flex flex-col items-center justify-center gap-3 py-10 px-6 text-center">
              {isUploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-[#FFEE34] animate-spin" />
                  <p className="text-sm text-white/60">Uploading to Cloudinary…</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-[#FFEE34]/10 flex items-center justify-center group-hover:bg-[#FFEE34]/20 transition-colors">
                    <Upload className="w-6 h-6 text-[#FFEE34]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Drop image here or click to browse</p>
                    <p className="text-xs text-white/40 mt-1">JPEG PNG WebP GIF AVIF · max 10 MB</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        /* URL Mode */
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#FFEE34] focus:ring-1 focus:ring-[#FFEE34] transition-all text-sm"
          />
          <div className="w-12 h-12 rounded-lg bg-[#061520] border border-[#14304A] flex items-center justify-center flex-shrink-0 overflow-hidden">
            {value ? (
              <Image src={value} alt="Preview" width={48} height={48} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-5 h-5 text-white/30" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
