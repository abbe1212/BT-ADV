"use client";

import React, { useState, useCallback } from "react";
import { Plus, Edit2, Trash2, X, Star, Loader2, MessageSquareQuote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Review, Client } from "@/lib/supabase/types";
import { insertReview, updateReview, deleteReview } from "@/lib/supabase/mutations";
import type { ReviewInsert, ReviewUpdate } from "@/lib/supabase/mutations";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { toast } from "sonner";
import { useConfirm } from "@/providers/ConfirmProvider";

interface ReviewsPageProps {
  initialReviews: Review[];
  clients: Client[];
}

export function ReviewsPage({ initialReviews, clients }: ReviewsPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Review | null>(null);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { confirm } = useConfirm();
  const isAdmin = true; // Assuming role context wraps this in real app

  const [formData, setFormData] = useState({
    client_id: '',
    reviewer_name: '',
    reviewer_role: '',
    content_ar: '',
    content_en: '',
    rating: 5,
    is_featured: false,
    order_index: 0,
  });

  useRealtimeSubscription<Review>({
    table: 'reviews',
    onInsert: useCallback((newItem: Review) => {
      // Re-attach client manually if needed, or query it when fetching.
      // Usually realtime payloads don't include joins. We attach from our `clients` array:
      const fullItem = { ...newItem, clients: clients.find(c => c.id === newItem.client_id) };
      setReviews(prev => [fullItem, ...prev]);
    }, [clients]),
    onUpdate: useCallback((updatedItem: Review) => {
      const fullItem = { ...updatedItem, clients: clients.find(c => c.id === updatedItem.client_id) };
      setReviews(prev => prev.map(item => item.id === updatedItem.id ? fullItem : item));
    }, [clients]),
    onDelete: useCallback(({ id }: { id: string }) => {
      setReviews(prev => prev.filter(item => item.id !== id));
    }, []),
  });

  const setLoading = (id: string, isLoading: boolean) => {
    setLoadingIds(prev => {
      const next = new Set(prev);
      if (isLoading) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const resetForm = () => {
    setFormData({
      client_id: '',
      reviewer_name: '',
      reviewer_role: '',
      content_ar: '',
      content_en: '',
      rating: 5,
      is_featured: false,
      order_index: 0,
    });
    setEditingItem(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (review: Review) => {
    setEditingItem(review);
    setFormData({
      client_id: review.client_id,
      reviewer_name: review.reviewer_name,
      reviewer_role: review.reviewer_role || '',
      content_ar: review.content_ar,
      content_en: review.content_en || '',
      rating: review.rating || 5,
      is_featured: review.is_featured,
      order_index: review.order_index,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(resetForm, 300);
  };

  const handleSubmit = async () => {
    if (!formData.client_id) {
      toast.error('Please select a client');
      return;
    }
    if (!formData.reviewer_name.trim()) {
      toast.error('Please enter the reviewer name');
      return;
    }
    if (!formData.content_ar.trim()) {
      toast.error('Please enter the review content in Arabic');
      return;
    }

    setIsSubmitting(true);

    const payload: ReviewInsert | ReviewUpdate = {
      client_id: formData.client_id,
      reviewer_name: formData.reviewer_name,
      reviewer_role: formData.reviewer_role || null,
      content_ar: formData.content_ar,
      content_en: formData.content_en || null,
      rating: formData.rating,
      is_featured: formData.is_featured,
      order_index: formData.order_index,
    };

    let error;

    if (editingItem) {
      const result = await updateReview({ id: editingItem.id, ...payload });
      error = result.error;
      if (!error) toast.success('Review updated successfully');
    } else {
      const result = await insertReview(payload as ReviewInsert);
      error = result.error;
      if (!error) toast.success('Review added successfully');
    }

    setIsSubmitting(false);

    if (error) {
      toast.error(`Failed to save review: ${error}`);
      return;
    }

    closeModal();
  };

  const handleDelete = async (review: Review) => {
    const isConfirmed = await confirm({
      title: "Delete Review",
      message: `Are you sure you want to delete this review by ${review.reviewer_name}?`,
      confirmText: "Delete",
      isDestructive: true,
    });
    if (!isConfirmed) return;

    setLoading(review.id, true);
    const { error } = await deleteReview(review.id);
    setLoading(review.id, false);

    if (error) {
      toast.error(`Failed to delete review: ${error}`);
    } else {
      toast.success('Review deleted');
    }
  };

  // Toggle featured status directly from table
  const toggleFeatured = async (review: Review) => {
    setLoading(review.id, true);
    const { error } = await updateReview({ id: review.id, is_featured: !review.is_featured });
    setLoading(review.id, false);

    if (error) {
      toast.error(`Failed to update status: ${error}`);
    } else {
      toast.success(`Review ${!review.is_featured ? 'featured' : 'unfeatured'}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-[#0A1F33] p-6 rounded-2xl border border-[#14304A]">
        <div>
          <div className="text-xs text-white/50 mb-1 flex items-center gap-2">
            <span>Admin Dashboard</span>
            <span>/</span>
            <span className="text-white/80">Reviews</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Manage Reviews</h2>
          <p className="text-sm text-white/50">إدارة آراء العملاء والتقييمات</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#FFEE34] text-[#00203C] hover:bg-white transition-colors px-6 py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(255,238,52,0.3)]"
        >
          <Plus className="w-5 h-5" />
          <span>Add Review</span>
        </button>
      </div>

      {/* Table view */}
      <div className="bg-[#0A1F33] rounded-2xl border border-[#14304A] overflow-hidden">
        {reviews.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquareQuote className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/50">No reviews yet. Click "Add Review" to create one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white/80">
              <thead className="bg-[#061520] text-xs uppercase text-white/50 border-b border-[#14304A]">
                <tr>
                  <th className="px-6 py-4 font-medium">Reviewer</th>
                  <th className="px-6 py-4 font-medium">Client</th>
                  <th className="px-6 py-4 font-medium text-center">Rating</th>
                  <th className="px-6 py-4 font-medium text-center">Featured</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#14304A]">
                {reviews.map((review) => {
                  const isLoading = loadingIds.has(review.id);
                  const client = review.clients || clients.find(c => c.id === review.client_id);
                  
                  return (
                    <tr key={review.id} className={`hover:bg-[#061520] transition-colors ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{review.reviewer_name}</div>
                        {review.reviewer_role && <div className="text-xs text-white/50">{review.reviewer_role}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {client?.logo_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={client.logo_url} alt={client.name} className="w-6 h-6 object-contain" />
                          )}
                          <span>{client?.name || 'Unknown Client'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-[#FFEE34]">
                        <div className="flex items-center justify-center gap-0.5">
                          {review.rating} <Star className="w-3.5 h-3.5 fill-current" />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleFeatured(review)}
                          className={`w-10 h-5 rounded-full relative transition-colors ${review.is_featured ? 'bg-[#FFEE34]' : 'bg-[#14304A]'}`}
                        >
                          <div className={`w-4 h-4 bg-[#00203C] rounded-full absolute top-0.5 transition-transform ${review.is_featured ? 'translate-x-5' : 'translate-x-0.5 bg-white'}`} />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(review)}
                            className="p-1.5 rounded-lg bg-[#14304A] text-white hover:bg-[#FFEE34] hover:text-[#00203C] transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(review)}
                              className="p-1.5 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-[#020F1C]/80 backdrop-blur-sm" />
           
           <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-[#0A1F33] rounded-2xl overflow-hidden shadow-2xl border-t-4 border-[#FFEE34] flex flex-col max-h-[90vh]">
             <div className="flex items-center justify-between p-6 border-b border-[#14304A] bg-[#061520] flex-shrink-0">
               <h3 className="text-xl font-bold text-white">
                 {editingItem ? 'Edit Review' : 'Add Review'}
               </h3>
               <button onClick={closeModal} className="text-white/50 hover:text-white transition-colors bg-[#0A1F33] p-1.5 rounded-lg border border-[#14304A]">
                 <X className="w-5 h-5" />
               </button>
             </div>

             <div className="p-6 space-y-5 overflow-y-auto scrollbar-thin scrollbar-thumb-[#FFEE34] scrollbar-track-transparent">
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                   <label className="text-sm font-bold text-white">Reviewer Name *</label>
                   <input
                     type="text"
                     value={formData.reviewer_name}
                     onChange={(e) => setFormData({ ...formData, reviewer_name: e.target.value })}
                     className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none"
                     placeholder="e.g. Ahmed Hassan"
                   />
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-sm font-bold text-white">Reviewer Role (Optional)</label>
                   <input
                     type="text"
                     value={formData.reviewer_role}
                     onChange={(e) => setFormData({ ...formData, reviewer_role: e.target.value })}
                     className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none"
                     placeholder="e.g. Marketing Director"
                   />
                 </div>
               </div>

               <div className="space-y-1.5">
                 <label className="text-sm font-bold text-white">Client *</label>
                 <select
                   value={formData.client_id}
                   onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                   className="w-full bg-[#061520] text-white/90 border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none appearance-none cursor-pointer"
                 >
                   <option value="">Select a Client...</option>
                   {clients.map(client => (
                     <option key={client.id} value={client.id}>{client.name}</option>
                   ))}
                 </select>
               </div>

               <div className="space-y-1.5">
                 <label className="text-sm font-bold text-white">Content (Arabic) *</label>
                 <textarea
                   value={formData.content_ar}
                   onChange={(e) => setFormData({ ...formData, content_ar: e.target.value })}
                   dir="rtl"
                   rows={4}
                   className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none text-right"
                   placeholder="التقييم بالعربي..."
                 />
               </div>

               <div className="space-y-1.5">
                 <label className="text-sm font-bold text-white">Content (English) - Optional</label>
                 <textarea
                   value={formData.content_en}
                   onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                   rows={3}
                   className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none"
                   placeholder="English review..."
                 />
               </div>

               <div className="grid grid-cols-3 gap-4 pt-2 border-t border-[#14304A]">
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-white block">Rating</label>
                   <div className="flex items-center gap-1">
                     {[1, 2, 3, 4, 5].map(star => (
                       <button
                         key={star}
                         onClick={() => setFormData({ ...formData, rating: star })}
                         className="focus:outline-none transition-transform hover:scale-110"
                       >
                         <Star className={`w-6 h-6 ${star <= formData.rating ? 'fill-[#FFEE34] text-[#FFEE34]' : 'text-white/20'}`} />
                       </button>
                     ))}
                   </div>
                 </div>

                 <div className="space-y-2 flex flex-col items-center justify-center border-l border-r border-[#14304A]">
                   <label className="text-sm font-bold text-white cursor-pointer hover:text-[#FFEE34] transition-colors flex items-center gap-2">
                     <input
                       type="checkbox"
                       checked={formData.is_featured}
                       onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                       className="w-4 h-4 accent-[#FFEE34]"
                     />
                     Mark Featured
                   </label>
                   <span className="text-[10px] text-white/40">Shows on home page</span>
                 </div>

                 <div className="space-y-1.5 px-4">
                   <label className="text-xs font-bold text-white/50 block">Sort Order</label>
                   <input
                     type="number"
                     value={formData.order_index}
                     onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                     className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-3 py-1.5 focus:border-[#FFEE34] focus:outline-none text-sm block"
                   />
                 </div>
               </div>

             </div>

             <div className="p-5 border-t border-[#14304A] bg-[#061520] flex justify-end gap-3 flex-shrink-0">
               <button
                 onClick={closeModal}
                 disabled={isSubmitting}
                 className="px-6 py-2.5 text-[#FFEE34] border border-[#FFEE34] hover:bg-[#FFEE34]/10 rounded-lg font-bold transition-colors disabled:opacity-50"
               >
                 Cancel
               </button>
               <button
                 onClick={handleSubmit}
                 disabled={isSubmitting}
                 className="px-8 py-2.5 bg-[#FFEE34] text-[#00203C] rounded-lg font-bold hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-2"
               >
                 {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                 {editingItem ? 'Update Review' : 'Save Review'}
               </button>
             </div>
           </motion.div>
         </div>
        )}
      </AnimatePresence>
    </div>
  );
}
