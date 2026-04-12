'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Link } from 'lucide-react';
import Image from 'next/image';
import { uploadFile } from '@/lib/supabase/storage';
import { toast } from 'sonner';

interface ImageUploadInputProps {
  /** Current image URL value (used to display preview) */
  value: string;
  /** Called with the new URL when upload succeeds or when URL is typed manually */
  onChange: (url: string) => void;
  /** Supabase Storage bucket name (must be public). Default: 'works' */
  bucket?: string;
  /** Optional storage sub-folder */
  folder?: string;
  /** Placeholder text for the URL input fallback */
  placeholder?: string;
  /** Label shown above the component */
  label?: string;
  /** Mark as required */
  required?: boolean;
}

export function ImageUploadInput({
  value,
  onChange,
  bucket = 'works',
  folder,
  placeholder = 'https://',
  label,
  required = false,
}: ImageUploadInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image must be smaller than 10 MB.');
        return;
      }

      setIsUploading(true);
      const { url, error } = await uploadFile(bucket, file, folder);
      setIsUploading(false);

      if (error) {
        toast.error(`Upload failed: ${error}`);
        return;
      }
      if (url) {
        onChange(url);
        toast.success('Image uploaded successfully');
      }
    },
    [bucket, folder, onChange]
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
            mode === 'upload'
              ? 'bg-[#FFEE34] text-[#00203C]'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <Upload className="w-3 h-3" />
          Upload
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`px-3 py-1 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 ${
            mode === 'url'
              ? 'bg-[#FFEE34] text-[#00203C]'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <Link className="w-3 h-3" />
          URL
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
            accept="image/*"
            className="hidden"
            onChange={handleFileInputChange}
          />

          {value ? (
            /* Preview */
            <div className="relative aspect-video w-full overflow-hidden rounded-xl">
              <Image
                src={value}
                alt="Preview"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Click or drag to replace
                </span>
              </div>
              {/* Clear button */}
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
                  <p className="text-sm text-white/60">Uploading image...</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-[#FFEE34]/10 flex items-center justify-center group-hover:bg-[#FFEE34]/20 transition-colors">
                    <Upload className="w-6 h-6 text-[#FFEE34]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      Drop image here or click to browse
                    </p>
                    <p className="text-xs text-white/40 mt-1">
                      PNG, JPG, WEBP up to 10 MB
                    </p>
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
          {/* Preview thumbnail */}
          <div className="w-12 h-12 rounded-lg bg-[#061520] border border-[#14304A] flex items-center justify-center flex-shrink-0 overflow-hidden">
            {value ? (
              <Image
                src={value}
                alt="Preview"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-5 h-5 text-white/30" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
