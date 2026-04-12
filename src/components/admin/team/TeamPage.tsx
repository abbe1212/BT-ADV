"use client";

import React, { useState, useCallback } from "react";
import { Plus, Edit2, Trash2, X, Star, Camera, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import type { TeamMember } from "@/lib/supabase/types";
import { insertTeamMember, updateTeamMember, deleteTeamMember, type TeamMemberInsert } from "@/lib/supabase/mutations";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { toast } from "sonner";
import { useConfirm } from "@/providers/ConfirmProvider";

interface TeamPageProps {
  initialMembers: TeamMember[];
}

interface FormData {
  name_en: string;
  name_ar: string;
  role_en: string;
  role_ar: string;
  image_url: string;
  is_featured: boolean;
  order_index: number;
}

const emptyForm: FormData = {
  name_en: "",
  name_ar: "",
  role_en: "",
  role_ar: "",
  image_url: "",
  is_featured: false,
  order_index: 0,
};

export function TeamPage({ initialMembers }: TeamPageProps) {
  const [members, setMembers] = useState(initialMembers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { confirm } = useConfirm();

  const isAdmin = true;

  // Real-time subscription
  useRealtimeSubscription<TeamMember>({
    table: 'team',
    onInsert: useCallback((newMember: TeamMember) => {
      setMembers(prev => [...prev, newMember].sort((a, b) => a.order_index - b.order_index));
    }, []),
    onUpdate: useCallback((updatedMember: TeamMember) => {
      setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    }, []),
    onDelete: useCallback(({ id }: { id: string }) => {
      setMembers(prev => prev.filter(m => m.id !== id));
    }, []),
  });

  const openModal = (item?: TeamMember) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name_en: item.name_en || "",
        name_ar: item.name_ar,
        role_en: item.role_en || "",
        role_ar: item.role_ar,
        image_url: item.image_url || "",
        is_featured: item.is_featured,
        order_index: item.order_index,
      });
    } else {
      setEditingItem(null);
      setFormData(emptyForm);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData(emptyForm);
  };

  const handleChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name_ar || !formData.role_ar) {
      toast.error("Name (Arabic) and Role (Arabic) are required");
      return;
    }

    setIsSaving(true);

    const payload: TeamMemberInsert = {
      name_ar: formData.name_ar,
      name_en: formData.name_en || null,
      role_ar: formData.role_ar,
      role_en: formData.role_en || null,
      image_url: formData.image_url || null,
      is_featured: formData.is_featured,
      order_index: formData.order_index,
    };

    if (editingItem) {
      const { error } = await updateTeamMember({ id: editingItem.id, ...payload });
      if (error) {
        toast.error(`Failed to update: ${error}`);
        setIsSaving(false);
        return;
      }
      toast.success("Member updated successfully");
    } else {
      const { error } = await insertTeamMember(payload);
      if (error) {
        toast.error(`Failed to create: ${error}`);
        setIsSaving(false);
        return;
      }
      toast.success("Member added successfully");
    }

    setIsSaving(false);
    closeModal();
  };

  const handleDelete = async (member: TeamMember) => {
    const isConfirmed = await confirm({
      title: "Delete Team Member",
      message: `Are you sure you want to delete "${member.name_ar}"? This action cannot be undone.`,
      confirmText: "Delete",
      isDestructive: true,
    });
    if (!isConfirmed) return;
    setDeletingId(member.id);
    const { error } = await deleteTeamMember(member.id);
    setDeletingId(null);
    if (error) {
      toast.error(`Failed to delete: ${error}`);
    } else {
      toast.success("Member deleted");
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
            <span className="text-white/80">Team</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Team Members</h2>
          <p className="text-sm text-white/50">إدارة أعضاء الفريق</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-[#FFEE34] text-[#00203C] hover:bg-white transition-colors px-6 py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(255,238,52,0.3)]"
        >
          <Plus className="w-5 h-5" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Grid */}
      {members.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {members.map(member => (
            <div 
              key={member.id} 
              className={`bg-[#0A1F33] rounded-2xl p-6 border group relative overflow-hidden transition-all ${
                member.is_featured ? "border-[#FFEE34]/30 shadow-[0_0_20px_rgba(255,238,52,0.05)] scale-[1.02]" : "border-[#14304A] hover:border-[#FFEE34]/20"
              } ${deletingId === member.id ? "opacity-50 pointer-events-none" : ""}`}
            >
              {/* Actions overlay */}
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={() => openModal(member)} className="w-8 h-8 rounded-full bg-[#14304A] text-white hover:bg-[#FFEE34] hover:text-[#00203C] flex items-center justify-center transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {isAdmin && (
                  <button 
                    onClick={() => handleDelete(member)}
                    className="w-8 h-8 rounded-full bg-red-500/80 text-white hover:bg-red-500 flex items-center justify-center transition-colors"
                  >
                    {deletingId === member.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              {member.is_featured && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFEE34] to-transparent" />
              )}

              <div className="flex flex-col items-center text-center mt-2">
                <div className="mb-4 relative">
                  <div className={`w-24 h-24 rounded-full overflow-hidden border-2 ${member.is_featured ? 'border-[#FFEE34] shadow-[0_0_15px_rgba(255,238,52,0.3)]' : 'border-[#14304A]'}`}>
                    {member.image_url ? (
                      <Image src={member.image_url} alt={member.name_en || member.name_ar} width={96} height={96} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#061520] flex items-center justify-center">
                        <Camera className="w-8 h-8 text-[#14304A]" />
                      </div>
                    )}
                  </div>
                  {member.is_featured && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#0A1F33] flex items-center justify-center">
                      <Star className="w-5 h-5 text-[#FFEE34] fill-[#FFEE34]" />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{member.name_ar}</h3>
                <p className="text-xs font-medium text-white/50 mb-3">{member.name_en}</p>
                
                <div className="bg-[#061520] px-4 py-1.5 rounded-full border border-[#14304A]">
                  <span className="text-sm font-bold text-[#FFEE34]">{member.role_ar}</span>
                  <span className="text-xs text-white/40 ml-2">/ {member.role_en}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#0A1F33] rounded-2xl border border-[#14304A] p-16 text-center text-white flex flex-col items-center">
          <div className="w-16 h-16 bg-[#061520] rounded-full flex items-center justify-center mb-4">
            <Camera className="w-8 h-8 text-[#14304A]" />
          </div>
          <h3 className="text-xl font-bold mb-2">لا يوجد أعضاء في الفريق</h3>
          <p className="text-sm text-white/50 mb-6">No team members added yet.</p>
          <button onClick={() => openModal()} className="px-6 py-2 bg-[#FFEE34] text-[#00203C] rounded-lg font-bold hover:bg-white transition-colors">
            Add Member
          </button>
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
                  {editingItem?.id ? "Edit Member" : "Add Team Member"}
                </h3>
                <button onClick={closeModal} className="text-white/50 hover:text-white transition-colors bg-[#0A1F33] p-1.5 rounded-lg border border-[#14304A]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-white">Name (EN)</label>
                    <input 
                      type="text" 
                      value={formData.name_en}
                      onChange={(e) => handleChange('name_en', e.target.value)}
                      className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none" 
                    />
                  </div>
                  <div className="space-y-1.5 text-right">
                    <label className="text-sm font-bold text-white">الاسم (عربي) *</label>
                    <input 
                      type="text" dir="rtl" 
                      value={formData.name_ar}
                      onChange={(e) => handleChange('name_ar', e.target.value)}
                      className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-white">Role (EN)</label>
                    <input 
                      type="text" 
                      value={formData.role_en}
                      onChange={(e) => handleChange('role_en', e.target.value)}
                      className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none" 
                    />
                  </div>
                  <div className="space-y-1.5 text-right">
                    <label className="text-sm font-bold text-white">المسمى (عربي) *</label>
                    <input 
                      type="text" dir="rtl" 
                      value={formData.role_ar}
                      onChange={(e) => handleChange('role_ar', e.target.value)}
                      className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-white">Image URL</label>
                  <div className="flex gap-3 items-center">
                    <input 
                      type="text" 
                      value={formData.image_url}
                      onChange={(e) => handleChange('image_url', e.target.value)}
                      className="flex-1 bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none" 
                      placeholder="https://" 
                    />
                    <div className="w-10 h-10 rounded-full border border-[#14304A] bg-[#061520] overflow-hidden flex-shrink-0">
                      {formData.image_url ? (
                        <Image src={formData.image_url} alt="" width={40} height={40} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Camera className="w-4 h-4 text-white/30" /></div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      id="featuredM" 
                      checked={formData.is_featured}
                      onChange={(e) => handleChange('is_featured', e.target.checked)}
                      className="w-5 h-5 accent-[#FFEE34] bg-[#061520] border-[#14304A] rounded" 
                    />
                    <label htmlFor="featuredM" className="font-bold text-white text-sm select-none">Mark as Featured Member</label>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/50">Order Index</label>
                    <input 
                      type="number" 
                      value={formData.order_index}
                      onChange={(e) => handleChange('order_index', parseInt(e.target.value) || 0)}
                      className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-3 py-1.5 focus:border-[#FFEE34] focus:outline-none text-sm" 
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-[#14304A] bg-[#061520] flex justify-end gap-3">
                <button onClick={closeModal} disabled={isSaving} className="px-6 py-2.5 text-white/70 hover:text-white font-bold transition-colors disabled:opacity-50">Cancel</button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-8 py-2.5 bg-[#FFEE34] text-[#00203C] rounded-lg font-bold hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
