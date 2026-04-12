"use client";

import React, { useState, useCallback } from "react";
import { Plus, GripVertical, Edit2, Trash2, X, Briefcase, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Service } from "@/lib/supabase/types";
import { insertService, updateService, deleteService, type ServiceInsert } from "@/lib/supabase/mutations";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { toast } from "sonner";
import { useConfirm } from "@/providers/ConfirmProvider";

interface ServicesPageProps {
  initialServices: Service[];
}

interface FormData {
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  icon: string;
  order_index: number;
}

const emptyForm: FormData = {
  title_en: "",
  title_ar: "",
  description_en: "",
  description_ar: "",
  icon: "",
  order_index: 0,
};

export function ServicesPage({ initialServices }: ServicesPageProps) {
  const [services, setServices] = useState(initialServices);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Service | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { confirm } = useConfirm();
  
  const isAdmin = true;

  // Real-time subscription
  useRealtimeSubscription<Service>({
    table: 'services',
    onInsert: useCallback((newSvc: Service) => {
      setServices(prev => [...prev, newSvc].sort((a, b) => a.order_index - b.order_index));
    }, []),
    onUpdate: useCallback((updatedSvc: Service) => {
      setServices(prev => prev.map(s => s.id === updatedSvc.id ? updatedSvc : s));
    }, []),
    onDelete: useCallback(({ id }: { id: string }) => {
      setServices(prev => prev.filter(s => s.id !== id));
    }, []),
  });

  const openModal = (item?: Service) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title_en: item.title_en || "",
        title_ar: item.title_ar,
        description_en: item.description_en || "",
        description_ar: item.description_ar || "",
        icon: item.icon || "",
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

  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title_ar) {
      toast.error("Title (Arabic) is required");
      return;
    }

    setIsSaving(true);

    const payload: ServiceInsert = {
      title_ar: formData.title_ar,
      title_en: formData.title_en || null,
      description_ar: formData.description_ar || null,
      description_en: formData.description_en || null,
      icon: formData.icon || null,
      order_index: formData.order_index,
    };

    if (editingItem) {
      const { error } = await updateService({ id: editingItem.id, ...payload });
      if (error) {
        toast.error(`Failed to update: ${error}`);
        setIsSaving(false);
        return;
      }
      toast.success("Service updated successfully");
    } else {
      const { error } = await insertService(payload);
      if (error) {
        toast.error(`Failed to create: ${error}`);
        setIsSaving(false);
        return;
      }
      toast.success("Service created successfully");
    }

    setIsSaving(false);
    closeModal();
  };

  const handleDelete = async (svc: Service) => {
    const isConfirmed = await confirm({
      title: "Delete Service",
      message: `Are you sure you want to delete "${svc.title_ar}"? This action cannot be undone.`,
      confirmText: "Delete",
      isDestructive: true,
    });
    if (!isConfirmed) return;
    setDeletingId(svc.id);
    const { error } = await deleteService(svc.id);
    setDeletingId(null);
    if (error) {
      toast.error(`Failed to delete: ${error}`);
    } else {
      toast.success("Service deleted");
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
            <span className="text-white/80">Services</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Our Services</h2>
          <p className="text-sm text-white/50">إدارة الخدمات</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-[#FFEE34] text-[#00203C] hover:bg-white transition-colors px-6 py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(255,238,52,0.3)]"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Service</span>
        </button>
      </div>

      <div className="bg-[#0A1F33] rounded-2xl border border-[#14304A] overflow-hidden">
        {services.length > 0 ? (
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-white/50 uppercase bg-[#061520] border-b border-[#14304A]">
              <tr>
                <th className="px-4 py-4 w-10"></th>
                <th className="px-6 py-4 font-medium w-16">Icon</th>
                <th className="px-6 py-4 font-medium">Service Name</th>
                <th className="px-6 py-4 font-medium">Description Preview</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#14304A]">
              {services.map((svc) => (
                <tr 
                  key={svc.id} 
                  className={`hover:bg-[#0d2538] transition-colors group ${deletingId === svc.id ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <td className="px-4 py-4">
                    <button className="text-white/20 hover:text-[#FFEE34] cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="px-6 py-4 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 bg-[#FFEE34] transition-all" />
                    <div className="w-10 h-10 rounded-lg bg-[#061520] border border-[#14304A] flex items-center justify-center text-[#FFEE34]">
                      <Briefcase className="w-5 h-5" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-white text-base font-['Cairo']">{svc.title_ar}</p>
                    <p className="text-xs text-white/50">{svc.title_en}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white/80 line-clamp-1 truncate w-48 font-['Cairo'] dir-rtl">{svc.description_ar}</p>
                    <p className="text-[10px] text-white/40 line-clamp-1 truncate w-48">{svc.description_en}</p>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(svc)} className="p-1.5 bg-[#14304A] text-white hover:bg-[#FFEE34] hover:text-[#00203C] rounded transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {isAdmin && (
                      <button 
                        onClick={() => handleDelete(svc)}
                        className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors"
                      >
                        {deletingId === svc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-16 text-center text-white flex flex-col items-center">
            <Briefcase className="w-16 h-16 text-[#14304A] mb-4" />
            <h3 className="text-xl font-bold mb-2">لا توجد خدمات متاحة</h3>
            <p className="text-sm text-white/50 mb-6">No services added yet.</p>
            <button onClick={() => openModal()} className="px-6 py-2 bg-[#FFEE34] text-[#00203C] rounded-lg font-bold hover:bg-white transition-colors">
              Add Service
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
         {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-xl bg-[#0A1F33] rounded-2xl overflow-hidden shadow-2xl border-t-4 border-[#FFEE34] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-[#14304A] bg-[#061520]">
                <h3 className="text-xl font-bold text-white">
                  {editingItem?.id ? "Edit Service" : "Add Service"}
                </h3>
                <button onClick={closeModal} className="text-white/50 hover:text-white transition-colors bg-[#0A1F33] p-1.5 rounded-lg border border-[#14304A]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-white">Title (EN)</label>
                    <input 
                      type="text" 
                      value={formData.title_en}
                      onChange={(e) => handleChange('title_en', e.target.value)}
                      className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none" 
                    />
                  </div>
                  <div className="space-y-1.5 text-right">
                    <label className="text-sm font-bold text-white">الخدمة (عربي) *</label>
                    <input 
                      type="text" dir="rtl" 
                      value={formData.title_ar}
                      onChange={(e) => handleChange('title_ar', e.target.value)}
                      className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-white">Icon Name</label>
                  <input 
                    type="text" 
                    value={formData.icon}
                    onChange={(e) => handleChange('icon', e.target.value)}
                    className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none" 
                    placeholder="e.g. Video, Camera, Briefcase" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-white">Description (EN)</label>
                  <textarea 
                    rows={3} 
                    value={formData.description_en}
                    onChange={(e) => handleChange('description_en', e.target.value)}
                    className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none resize-none"
                  ></textarea>
                </div>

                <div className="space-y-1.5 text-right">
                  <label className="text-sm font-bold text-white">الوصف (عربي)</label>
                  <textarea 
                    dir="rtl" 
                    rows={3} 
                    value={formData.description_ar}
                    onChange={(e) => handleChange('description_ar', e.target.value)}
                    className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none resize-none"
                  ></textarea>
                </div>

                 <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-white/50">Order Index</label>
                  <input 
                    type="number" 
                    value={formData.order_index}
                    onChange={(e) => handleChange('order_index', parseInt(e.target.value) || 0)}
                    className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-3 py-1.5 focus:border-[#FFEE34] focus:outline-none text-sm" 
                  />
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
