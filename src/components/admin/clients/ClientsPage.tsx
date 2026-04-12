"use client";

import React, { useState, useCallback } from "react";
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Loader2, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Client } from "@/lib/supabase/types";
import { insertClient, updateClient, deleteClient } from "@/lib/supabase/mutations";
import type { ClientInsert, ClientUpdate } from "@/lib/supabase/mutations";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { toast } from "sonner";
import { useConfirm } from "@/providers/ConfirmProvider";

// Common industries for the select dropdown
const INDUSTRIES = [
  "Food & Beverage",
  "Fashion",
  "Real Estate",
  "Technology",
  "Healthcare",
  "Education",
  "Automotive",
  "Retail",
  "Other"
];

interface ClientsPageProps {
  initialClients: Client[];
}

export function ClientsPage({ initialClients }: ClientsPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { confirm } = useConfirm();
  const isAdmin = true;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo_url: '',
    youtube_url: '',
    website_url: '',
    industry: '',
    order_index: 0,
  });

  // Auto-generate slug from name if slug is empty
  const handleNameChange = (name: string) => {
    // If we're creating a new client and haven't manually edited the slug yet, auto-populate it
    setFormData(prev => {
      const isNewForm = !editingItem;
      const noSlugYet = !prev.slug || prev.slug === createSlug(prev.name);
      
      return {
        ...prev,
        name,
        slug: (isNewForm && noSlugYet) ? createSlug(name) : prev.slug
      };
    });
  };

  const createSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  // Real-time subscription for clients
  useRealtimeSubscription<Client>({
    table: 'clients',
    onInsert: useCallback((newClient: Client) => {
      setClients(prev => [newClient, ...prev]);
    }, []),
    onUpdate: useCallback((updatedClient: Client) => {
      setClients(prev => prev.map(client => client.id === updatedClient.id ? updatedClient : client));
    }, []),
    onDelete: useCallback(({ id }: { id: string }) => {
      setClients(prev => prev.filter(client => client.id !== id));
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
      name: '',
      slug: '',
      logo_url: '',
      youtube_url: '',
      website_url: '',
      industry: '',
      order_index: 0,
    });
    setEditingItem(null);
  };

  // Open modal for adding new client
  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Open modal for editing existing client
  const openEditModal = (client: Client) => {
    setEditingItem(client);
    setFormData({
      name: client.name,
      slug: client.slug,
      logo_url: client.logo_url || '',
      youtube_url: client.youtube_url || '',
      website_url: client.website_url || '',
      industry: client.industry || '',
      order_index: client.order_index,
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
    if (!formData.name.trim()) {
      toast.error('Please enter a brand name');
      return;
    }
    if (!formData.slug.trim()) {
      toast.error('Please enter a standard slug');
      return;
    }

    setIsSubmitting(true);

    if (editingItem) {
      // Update existing client
      const payload: ClientUpdate = {
        id: editingItem.id,
        name: formData.name,
        slug: formData.slug,
        logo_url: formData.logo_url || null,
        youtube_url: formData.youtube_url || null,
        website_url: formData.website_url || null,
        industry: formData.industry || null,
        order_index: formData.order_index,
      };

      const { error } = await updateClient(payload);
      if (error) {
        toast.error(`Failed to update client: ${error}`);
      } else {
        toast.success('Client updated successfully');
      }
    } else {
      // Insert new client
      const payload: ClientInsert = {
        name: formData.name,
        slug: formData.slug,
        logo_url: formData.logo_url || null,
        youtube_url: formData.youtube_url || null,
        website_url: formData.website_url || null,
        industry: formData.industry || null,
        order_index: formData.order_index,
      };

      const { error } = await insertClient(payload);
      if (error) {
        toast.error(`Failed to add client: ${error}`);
      } else {
        toast.success('Client added successfully');
      }
    }

    setIsSubmitting(false);
    closeModal();
  };

  // Handle delete
  const handleDelete = async (client: Client) => {
    const isConfirmed = await confirm({
      title: "Delete Client",
      message: `Are you sure you want to delete ${client.name}? This action cannot be undone.`,
      confirmText: "Delete",
      isDestructive: true,
    });
    if (!isConfirmed) return;

    setLoading(client.id, true);
    const { error } = await deleteClient(client.id);
    setLoading(client.id, false);

    if (error) {
      toast.error(`Failed to delete client: ${error}`);
    } else {
      toast.success('Client deleted');
    }
  };

  // Sort clients by order_index
  const sortedClients = [...clients].sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-[#0A1F33] p-6 rounded-2xl border border-[#14304A]">
        <div>
          <div className="text-xs text-white/50 mb-1 flex items-center gap-2">
            <span>Admin Dashboard</span>
            <span>/</span>
            <span className="text-white/80">Clients</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Manage Clients</h2>
          <p className="text-sm text-white/50">إدارة العملاء ولوجوهاتهم</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#FFEE34] text-[#00203C] hover:bg-white transition-colors px-6 py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(255,238,52,0.3)]"
        >
          <Plus className="w-5 h-5" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Logos Grid */}
      {sortedClients.length === 0 ? (
        <div className="text-center py-16 bg-[#0A1F33] rounded-2xl border border-[#14304A]">
          <ImageIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50">No clients yet. Click "Add Client" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {sortedClients.map((client) => {
            const isLoading = loadingIds.has(client.id);

            return (
              <div key={client.id} className="bg-[#0A1F33] rounded-2xl border border-[#14304A] p-4 flex flex-col items-center justify-center group relative h-48">
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 text-[#FFEE34] animate-spin" />
                  ) : (
                    <>
                      <button
                        onClick={() => openEditModal(client)}
                        className="w-7 h-7 rounded bg-[#14304A] text-white hover:bg-[#FFEE34] hover:text-[#00203C] flex items-center justify-center transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(client)}
                          className="w-7 h-7 rounded bg-red-500/80 text-white hover:bg-red-500 flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </>
                  )}
                </div>
                
                <div className="flex-1 flex items-center justify-center w-full mb-3 relative">
                  {client.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={client.logo_url} alt={client.name} className="max-h-16 max-w-[80%] object-contain" />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-[#14304A]" />
                  )}
                  {client.youtube_url && (
                    <div className="absolute -top-2 -left-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg" title="Has YouTube Ad">
                      <Play className="w-3 h-3 ml-0.5" />
                    </div>
                  )}
                </div>

                <div className="w-full text-center mt-auto border-t border-[#14304A] pt-3">
                  <h4 className="text-white font-bold text-sm truncate px-1">
                    {client.name}
                  </h4>
                  {client.industry && (
                    <span className="text-[10px] text-white/40 uppercase tracking-wider block mt-0.5">
                      {client.industry}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

       {/* Modal */}
       <AnimatePresence>
        {isModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-[#020F1C]/80 backdrop-blur-sm" />
           
           <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-xl bg-[#0A1F33] rounded-2xl overflow-hidden shadow-2xl border-t-4 border-[#FFEE34] flex flex-col max-h-[90vh]">
             <div className="flex items-center justify-between p-6 border-b border-[#14304A] bg-[#061520] flex-shrink-0">
               <h3 className="text-xl font-bold text-white">
                 {editingItem ? 'Edit Client' : 'Add Client'}
               </h3>
               <button onClick={closeModal} className="text-white/50 hover:text-white transition-colors bg-[#0A1F33] p-1.5 rounded-lg border border-[#14304A]">
                 <X className="w-5 h-5" />
               </button>
             </div>

             <div className="p-6 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-[#FFEE34] scrollbar-track-transparent">
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                   <label className="text-sm font-bold text-white">Brand Name *</label>
                   <input
                     type="text"
                     value={formData.name}
                     onChange={(e) => handleNameChange(e.target.value)}
                     className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none"
                     placeholder="e.g. Tasty Spice"
                   />
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-sm font-bold text-white">URL Slug *</label>
                   <input
                     type="text"
                     value={formData.slug}
                     onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                     className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none"
                     placeholder="e.g. tasty-spice"
                   />
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                   <label className="text-sm font-bold text-white">Industry</label>
                   <select
                     value={formData.industry}
                     onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                     className="w-full bg-[#061520] text-white/90 border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none appearance-none"
                   >
                     <option value="">Select Industry...</option>
                     {INDUSTRIES.map(ind => (
                       <option key={ind} value={ind}>{ind}</option>
                     ))}
                   </select>
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-sm font-bold text-white">Website URL</label>
                   <input
                     type="text"
                     value={formData.website_url}
                     onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                     className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none"
                     placeholder="https://"
                   />
                 </div>
               </div>

               <div className="space-y-1.5">
                 <label className="text-sm font-bold text-white">Logo URL</label>
                 <input
                   type="text"
                   value={formData.logo_url}
                   onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                   className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none"
                   placeholder="https://"
                 />
                 <p className="text-xs text-white/40">Provide a direct URL to a transparent PNG</p>
               </div>

               <div className="space-y-1.5">
                 <label className="text-sm font-bold text-white">YouTube Ad URL</label>
                 <div className="relative">
                   <Play className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                   <input
                     type="text"
                     value={formData.youtube_url}
                     onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                     className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg pl-10 pr-4 py-2.5 focus:border-[#FFEE34] focus:outline-none"
                     placeholder="https://youtube.com/watch?v=..."
                   />
                 </div>
               </div>

                <div className="space-y-1.5 pt-2 border-t border-[#14304A]">
                 <label className="text-xs font-bold text-white/50">Sort Order Index</label>
                 <input
                   type="number"
                   value={formData.order_index}
                   onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                   className="w-24 bg-[#061520] text-white border border-[#14304A] rounded-lg px-3 py-1.5 focus:border-[#FFEE34] focus:outline-none text-sm block"
                 />
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
                 {editingItem ? 'Update Client' : 'Save Client'}
               </button>
             </div>
           </motion.div>
         </div>
        )}
      </AnimatePresence>
    </div>
  );
}
