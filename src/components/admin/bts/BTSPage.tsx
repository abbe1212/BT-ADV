"use client";

import React, { useState, useCallback } from "react";
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Video, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { BtsItem } from "@/lib/supabase/types";
import { insertBtsItem, updateBtsItem, deleteBtsItem } from "@/lib/supabase/mutations";
import type { BtsItemInsert, BtsItemUpdate } from "@/lib/supabase/mutations";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { toast } from "sonner";
import { useConfirm } from "@/providers/ConfirmProvider";

interface BTSPageProps {
  initialBts: BtsItem[];
}

export function BTSPage({ initialBts }: BTSPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BtsItem | null>(null);
  const [btsItems, setBtsItems] = useState<BtsItem[]>(initialBts);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { confirm } = useConfirm();
  const isAdmin = true;

  // Form state
  const [formData, setFormData] = useState({
    media_type: 'image' as 'image' | 'video',
    media_url: '',
    title_en: '',
    title_ar: '',
    order_index: 0,
  });

  // Real-time subscription for BTS items
  useRealtimeSubscription<BtsItem>({
    table: 'bts',
    onInsert: useCallback((newItem: BtsItem) => {
      setBtsItems(prev => [newItem, ...prev]);
    }, []),
    onUpdate: useCallback((updatedItem: BtsItem) => {
      setBtsItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    }, []),
    onDelete: useCallback(({ id }: { id: string }) => {
      setBtsItems(prev => prev.filter(item => item.id !== id));
    }, []),
  });

  // Helper to manage loading state
  const setLoading = (id: string, isLoading: boolean) => {
    setLoadingIds(prev => {
      const next = new Set(prev);
      if (isLoading) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      media_type: 'image',
      media_url: '',
      title_en: '',
      title_ar: '',
      order_index: 0,
    });
    setEditingItem(null);
  };

  // Open modal for adding new item
  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Open modal for editing existing item
  const openEditModal = (item: BtsItem) => {
    setEditingItem(item);
    setFormData({
      media_type: item.media_type,
      media_url: item.media_url,
      title_en: item.title_en || '',
      title_ar: item.title_ar || '',
      order_index: item.order_index,
    });
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(resetForm, 300); // Reset after animation
  };

  // Handle form submit (add or update)
  const handleSubmit = async () => {
    // Validation
    if (!formData.media_url.trim()) {
      toast.error('Please enter a media URL');
      return;
    }

    setIsSubmitting(true);

    if (editingItem) {
      // Update existing item
      const payload: BtsItemUpdate = {
        id: editingItem.id,
        media_type: formData.media_type,
        media_url: formData.media_url,
        title_en: formData.title_en || null,
        title_ar: formData.title_ar || null,
        order_index: formData.order_index,
      };

      const { error } = await updateBtsItem(payload);
      if (error) {
        toast.error(`Failed to update item: ${error}`);
      } else {
        toast.success('BTS item updated');
      }
    } else {
      // Insert new item
      const payload: BtsItemInsert = {
        media_type: formData.media_type,
        media_url: formData.media_url,
        title_en: formData.title_en || null,
        title_ar: formData.title_ar || null,
        order_index: formData.order_index,
      };

      const { error } = await insertBtsItem(payload);
      if (error) {
        toast.error(`Failed to add item: ${error}`);
      } else {
        toast.success('BTS item added to gallery');
      }
    }

    setIsSubmitting(false);
    closeModal();
  };

  // Handle delete
  const handleDelete = async (item: BtsItem) => {
    const isConfirmed = await confirm({
      title: "Delete Media",
      message: "Are you sure you want to delete this media item? This action cannot be undone.",
      confirmText: "Delete",
      isDestructive: true,
    });
    if (!isConfirmed) return;

    setLoading(item.id, true);
    const { error } = await deleteBtsItem(item.id);
    setLoading(item.id, false);

    if (error) {
      toast.error(`Failed to delete item: ${error}`);
    } else {
      toast.success('Media item deleted');
    }
  };

  // Sort items by order_index
  const sortedItems = [...btsItems].sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-[#0A1F33] p-6 rounded-2xl border border-[#14304A]">
        <div>
          <div className="text-xs text-white/50 mb-1 flex items-center gap-2">
            <span>Admin Dashboard</span>
            <span>/</span>
            <span className="text-white/80">BTS</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Behind The Scenes</h2>
          <p className="text-sm text-white/50">كواليس الأعمال</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#FFEE34] text-[#00203C] hover:bg-white transition-colors px-6 py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(255,238,52,0.3)]"
        >
          <Plus className="w-5 h-5" />
          <span>Add Media</span>
        </button>
      </div>

      {/* Gallery Grid */}
      {sortedItems.length === 0 ? (
        <div className="text-center py-16 bg-[#0A1F33] rounded-2xl border border-[#14304A]">
          <ImageIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50">No media items yet. Click "Add Media" to get started.</p>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {sortedItems.map((item) => {
            const isLoading = loadingIds.has(item.id);
            const hasTitle = item.title_en || item.title_ar;

            return (
              <div key={item.id} className="bg-[#0A1F33] rounded-2xl border border-[#14304A] overflow-hidden group relative break-inside-avoid">
                <div className="w-full bg-[#020F1C] relative aspect-video">
                  {/* Placeholder icon */}
                  <div className="absolute inset-0 flex items-center justify-center text-[#14304A] group-hover:text-white/10 transition-colors">
                    {item.media_type === 'video' ? <Video className="w-10 h-10" /> : <ImageIcon className="w-10 h-10" />}
                  </div>

                  {/* Media type badge */}
                  <div className="absolute top-2 left-2 bg-[#00203C] text-white/80 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
                    {item.media_type === 'video' ? (
                      <><Video className="w-3 h-3 text-[#FFEE34]" /> Video</>
                    ) : (
                      <><ImageIcon className="w-3 h-3 text-[#FFEE34]" /> Image</>
                    )}
                  </div>

                  {/* Hover overlay with actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 text-[#FFEE34] animate-spin" />
                    ) : (
                      <>
                        <button
                          onClick={() => openEditModal(item)}
                          className="w-10 h-10 rounded-full bg-[#FFEE34] text-[#00203C] hover:scale-110 flex items-center justify-center transition-transform"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(item)}
                            className="w-10 h-10 rounded-full bg-red-500 text-white hover:scale-110 flex items-center justify-center transition-transform"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Optional Title */}
                {hasTitle && (
                  <div className="p-3">
                    <p className="text-white text-sm font-bold truncate">
                      {item.title_en || item.title_ar}
                    </p>
                    <p className="text-white/50 text-[10px]">Title added</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

       {/* Modal */}
       <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-xl bg-[#0A1F33] rounded-2xl overflow-hidden shadow-2xl border-t-4 border-[#FFEE34] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-[#14304A] bg-[#061520]">
                <h3 className="text-xl font-bold text-white">
                  {editingItem ? 'Edit BTS Media' : 'Add BTS Media'}
                </h3>
                <button onClick={closeModal} className="text-white/50 hover:text-white transition-colors bg-[#0A1F33] p-1.5 rounded-lg border border-[#14304A]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-white">Media Type</label>
                  <select
                    value={formData.media_type}
                    onChange={(e) => setFormData({ ...formData, media_type: e.target.value as 'image' | 'video' })}
                    className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none appearance-none"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video Embed</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-white">URL *</label>
                  <input
                    type="text"
                    value={formData.media_url}
                    onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                    className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none"
                    placeholder="https://"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-white">Title (Optional)</label>
                    <input
                      type="text"
                      value={formData.title_en}
                      onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                      className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5 text-right">
                    <label className="text-sm font-bold text-white">العنوان (اختياري)</label>
                    <input
                      type="text"
                      value={formData.title_ar}
                      onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                      dir="rtl"
                      className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none"
                    />
                  </div>
                </div>

                 <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-white/50">Order Index</label>
                  <input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-3 py-1.5 focus:border-[#FFEE34] focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="p-5 border-t border-[#14304A] bg-[#061520] flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-white/70 hover:text-white font-bold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-2.5 bg-[#FFEE34] text-[#00203C] rounded-lg font-bold hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingItem ? 'Update Media' : 'Save To Gallery'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
