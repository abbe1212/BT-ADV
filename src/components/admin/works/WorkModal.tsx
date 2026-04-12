'use client';

import React, { useState, useEffect } from 'react';
import { X, Video, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { Work } from '@/lib/supabase/types';
import { insertWork, updateWork, type WorkInsert } from '@/lib/supabase/mutations';
import { ImageUploadInput } from '@/components/ui/ImageUploadInput';

// ─── Types ─────────────────────────────────────────────────────────────────────

const CATEGORIES = ['TV Commercial', 'Digital Ad', 'Music Video', 'Reel Campaign'] as const;

interface FormData {
  title_en: string;
  title_ar: string;
  category: string;
  image_url: string;
  video_url: string;
  year: number;
  order_index: number;
  featured: boolean;
}

const EMPTY_FORM: FormData = {
  title_en: '',
  title_ar: '',
  category: CATEGORIES[0],
  image_url: '',
  video_url: '',
  year: new Date().getFullYear(),
  order_index: 0,
  featured: false,
};

// ─── Props ─────────────────────────────────────────────────────────────────────

interface WorkModalProps {
  /** When null/undefined, the modal is in "create" mode. */
  work?: Work | null;
  isOpen: boolean;
  onClose: () => void;
  /** Called after a successful create or update. */
  onSuccess?: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Self-contained Create / Edit modal for a Work record.
 *
 * Responsibilities:
 * - Owns all form state (title, category, image, video, year, etc.)
 * - Handles create (insertWork) and update (updateWork) mutations.
 * - Calls `onClose` when cancelled or after a successful save.
 * - Calls `onSuccess` after save so the parent can refresh its list.
 *
 * Intentionally NOT responsible for:
 * - Managing `isOpen` — that's the parent's responsibility.
 * - Fetching the work list — the parent handles that.
 */
export function WorkModal({ work, isOpen, onClose, onSuccess }: WorkModalProps) {
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  // Sync form state when the modal is opened (create vs. edit mode)
  useEffect(() => {
    if (isOpen) {
      if (work) {
        setFormData({
          title_en:    work.title_en   ?? '',
          title_ar:    work.title_ar,
          category:    work.category,
          image_url:   work.image_url,
          video_url:   work.video_url  ?? '',
          year:        work.year,
          order_index: work.order_index,
          featured:    work.featured,
        });
      } else {
        setFormData(EMPTY_FORM);
      }
    }
  }, [isOpen, work]);

  const handleChange = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title_ar || !formData.image_url) {
      toast.error('Title (Arabic) and Cover Image are required');
      return;
    }

    setIsSaving(true);

    const payload: WorkInsert = {
      title_ar:    formData.title_ar,
      title_en:    formData.title_en    || null,
      category:    formData.category,
      image_url:   formData.image_url,
      video_url:   formData.video_url   || null,
      year:        formData.year,
      order_index: formData.order_index,
      featured:    formData.featured,
    };

    let error: string | null = null;

    if (work) {
      const result = await updateWork({ id: work.id, ...payload });
      error = result.error;
      if (!error) toast.success('Work updated successfully');
    } else {
      const result = await insertWork(payload);
      error = result.error;
      if (!error) toast.success('Work created successfully');
    }

    setIsSaving(false);

    if (error) {
      toast.error(`Failed to save: ${error}`);
      return;
    }

    onSuccess?.();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="work-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#020F1C]/80 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0A1F33] rounded-2xl border border-[#14304A] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#14304A] bg-[#061520] relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#FFEE34]" />
              <div>
                <h3 id="work-modal-title" className="text-xl font-bold text-white">
                  {work ? 'Edit Work' : 'Add New Work'}
                </h3>
                <p className="text-sm text-white/50">{work ? 'تعديل العمل' : 'إضافة عمل جديد'}</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="text-white/50 hover:text-white transition-colors bg-[#0A1F33] p-2 rounded-lg border border-[#14304A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5 scrollbar-thin scrollbar-thumb-[#FFEE34] scrollbar-track-transparent">
              {/* Title row */}
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-white">Title (English)</label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={e => handleChange('title_en', e.target.value)}
                    className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#FFEE34] focus:ring-1 focus:ring-[#FFEE34] transition-all"
                    placeholder="e.g. Summer Campaign"
                  />
                </div>
                <div className="space-y-1.5 text-right">
                  <label className="text-sm font-bold text-white">العنوان (عربي) *</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.title_ar}
                    onChange={e => handleChange('title_ar', e.target.value)}
                    className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#FFEE34] focus:ring-1 focus:ring-[#FFEE34] transition-all"
                    placeholder="مثال: حملة الصيف"
                  />
                </div>
              </div>

              {/* Category + Year */}
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-white">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => handleChange('category', e.target.value)}
                    className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#FFEE34] focus:ring-1 focus:ring-[#FFEE34] transition-all appearance-none cursor-pointer"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-white">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    min={2000}
                    max={new Date().getFullYear() + 1}
                    onChange={e => handleChange('year', parseInt(e.target.value) || new Date().getFullYear())}
                    className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#FFEE34] focus:ring-1 focus:ring-[#FFEE34] transition-all"
                  />
                </div>
              </div>

              {/* Cover Image Upload */}
              <ImageUploadInput
                label="Cover Image"
                required
                value={formData.image_url}
                onChange={url => handleChange('image_url', url)}
                bucket="works"
                folder="covers"
              />

              {/* Video URL */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-white">YouTube Video URL</label>
                <div className="relative">
                  <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={formData.video_url}
                    onChange={e => handleChange('video_url', e.target.value)}
                    className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#FFEE34] focus:ring-1 focus:ring-[#FFEE34] transition-all"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>

              {/* Order + Featured */}
              <div className="grid grid-cols-2 gap-5 pt-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-white">Order Number</label>
                  <input
                    type="number"
                    value={formData.order_index}
                    min={0}
                    onChange={e => handleChange('order_index', parseInt(e.target.value) || 0)}
                    className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#FFEE34] focus:ring-1 focus:ring-[#FFEE34] transition-all"
                  />
                </div>
                <div className="flex items-center mt-8 space-x-3">
                  <input
                    type="checkbox"
                    id="work-modal-featured"
                    checked={formData.featured}
                    onChange={e => handleChange('featured', e.target.checked)}
                    className="w-5 h-5 accent-[#FFEE34] rounded cursor-pointer"
                  />
                  <label htmlFor="work-modal-featured" className="text-sm font-bold text-white cursor-pointer select-none">
                    Mark as Featured Work
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-[#14304A] bg-[#061520] flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-lg border border-[#FFEE34] text-[#FFEE34] font-bold hover:bg-[#FFEE34]/10 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-8 py-2.5 rounded-lg bg-[#FFEE34] text-[#00203C] font-bold hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
