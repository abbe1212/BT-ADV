"use client";

import React, { useState, useCallback } from "react";
import { Plus, GripVertical, Edit2, Trash2, X, Star, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Pricing } from "@/lib/supabase/types";
import { insertPricing, updatePricing, deletePricing, type PricingInsert } from "@/lib/supabase/mutations";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { toast } from "sonner";
import { useConfirm } from "@/providers/ConfirmProvider";

const categories = ["Creative Ad", "Music Video Ad", "Marketing Reel", "Packages"];

interface PricingPageProps {
  initialPricing: Pricing[];
}

interface FormData {
  title_en: string;
  title_ar: string;
  category: string;
  price_from: number;
  price_to: number | null;
  price_note: string;
  is_popular: boolean;
  order_index: number;
}

const emptyForm: FormData = {
  title_en: "",
  title_ar: "",
  category: categories[0],
  price_from: 0,
  price_to: null,
  price_note: "بدون ضرائب",
  is_popular: false,
  order_index: 0,
};

export function PricingPage({ initialPricing }: PricingPageProps) {
  const [packages, setPackages] = useState(initialPricing);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Pricing | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { confirm } = useConfirm();
  
  const isAdmin = true;

  // Real-time subscription
  useRealtimeSubscription<Pricing>({
    table: 'pricing',
    onInsert: useCallback((newPkg: Pricing) => {
      setPackages(prev => [...prev, newPkg].sort((a, b) => a.order_index - b.order_index));
    }, []),
    onUpdate: useCallback((updatedPkg: Pricing) => {
      setPackages(prev => prev.map(p => p.id === updatedPkg.id ? updatedPkg : p));
    }, []),
    onDelete: useCallback(({ id }: { id: string }) => {
      setPackages(prev => prev.filter(p => p.id !== id));
    }, []),
  });

  const openModal = (item?: Pricing, defaultCategory?: string) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title_en: item.title_en || "",
        title_ar: item.title_ar,
        category: item.category,
        price_from: item.price_from,
        price_to: item.price_to,
        price_note: item.price_note || "بدون ضرائب",
        is_popular: item.is_popular,
        order_index: item.order_index,
      });
    } else {
      setEditingItem(null);
      setFormData({ ...emptyForm, category: defaultCategory || categories[0] });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData(emptyForm);
  };

  const handleChange = (field: keyof FormData, value: string | number | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title_ar || !formData.price_from) {
      toast.error("Title (Arabic) and Price From are required");
      return;
    }

    setIsSaving(true);

    const payload: PricingInsert = {
      title_ar: formData.title_ar,
      title_en: formData.title_en || null,
      category: formData.category,
      price_from: formData.price_from,
      price_to: formData.price_to,
      price_note: formData.price_note || null,
      is_popular: formData.is_popular,
      order_index: formData.order_index,
    };

    if (editingItem) {
      const { error } = await updatePricing({ id: editingItem.id, ...payload });
      if (error) {
        toast.error(`Failed to update: ${error}`);
        setIsSaving(false);
        return;
      }
      toast.success("Package updated successfully");
    } else {
      const { error } = await insertPricing(payload);
      if (error) {
        toast.error(`Failed to create: ${error}`);
        setIsSaving(false);
        return;
      }
      toast.success("Package created successfully");
    }

    setIsSaving(false);
    closeModal();
  };

  const handleDelete = async (pkg: Pricing) => {
    const isConfirmed = await confirm({
      title: "Delete Package",
      message: `Are you sure you want to delete "${pkg.title_ar}"? This action cannot be undone.`,
      confirmText: "Delete",
      isDestructive: true,
    });
    if (!isConfirmed) return;
    setDeletingId(pkg.id);
    const { error } = await deletePricing(pkg.id);
    setDeletingId(null);
    if (error) {
      toast.error(`Failed to delete: ${error}`);
    } else {
      toast.success("Package deleted");
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
            <span className="text-white/80">Pricing</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Pricing Packages</h2>
          <p className="text-sm text-white/50">إدارة باقات الأسعار</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-[#FFEE34] text-[#00203C] hover:bg-white transition-colors px-6 py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(255,238,52,0.3)]"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Package</span>
        </button>
      </div>

      {categories.map((category) => {
        const categoryPackages = packages.filter(p => p.category === category).sort((a,b) => a.order_index - b.order_index);
        
        return (
          <div key={category} className="bg-[#0A1F33] rounded-2xl border border-[#14304A] overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#14304A] bg-[#061520] relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FFEE34]" />
              <h3 className="text-lg font-bold text-[#FFEE34] ml-2">{category}</h3>
              <button 
                onClick={() => openModal(undefined, category)}
                className="flex items-center gap-1.5 text-xs font-bold text-white/80 border border-[#14304A] hover:bg-[#FFEE34] hover:text-[#00203C] hover:border-[#FFEE34] transition-colors px-3 py-1.5 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Package
              </button>
            </div>
            
            <div className="p-0">
              {categoryPackages.length > 0 ? (
                <table className="w-full text-sm text-left">
                  <thead className="text-[11px] text-white/50 uppercase bg-[#020F1C]/50 border-b border-[#14304A]">
                    <tr>
                      <th className="px-4 py-3 w-10"></th>
                      <th className="px-4 py-3 font-medium">Title AR</th>
                      <th className="px-4 py-3 font-medium">Title EN</th>
                      <th className="px-4 py-3 font-medium">Price Range (EGP)</th>
                      <th className="px-4 py-3 font-medium">Badges</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#14304A]">
                    {categoryPackages.map(pkg => (
                      <tr 
                        key={pkg.id} 
                        className={`hover:bg-[#0d2538] transition-colors group ${deletingId === pkg.id ? "opacity-50 pointer-events-none" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <button className="text-white/20 hover:text-[#FFEE34] cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-4 h-4" />
                          </button>
                        </td>
                        <td className="px-4 py-3 font-bold text-white font-['Cairo']">{pkg.title_ar}</td>
                        <td className="px-4 py-3 text-white/80">{pkg.title_en}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#FFEE34]">{pkg.price_from.toLocaleString()} – {pkg.price_to ? pkg.price_to.toLocaleString() : '+'} EGP</span>
                            <span className="text-[10px] text-white/40">{pkg.price_note}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {pkg.is_popular && (
                            <span className="inline-flex items-center gap-1 bg-[#FFEE34]/10 text-[#FFEE34] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#FFEE34]/20 uppercase">
                              <Star className="w-3 h-3" /> Popular
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button 
                             onClick={() => openModal(pkg)}
                             className="p-1.5 bg-[#14304A] text-white hover:bg-[#FFEE34] hover:text-[#00203C] rounded transition-colors"
                           >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button 
                              onClick={() => handleDelete(pkg)}
                              className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors" 
                              title="Super Admin Only"
                            >
                              {deletingId === pkg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-white/40 text-sm">
                  لا يوجد باقات مسجلة في هذا القسم. اضغط على أضف باقة للبدء.
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-xl bg-[#0A1F33] rounded-2xl overflow-hidden shadow-2xl border-t-4 border-[#FFEE34] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-[#14304A] bg-[#061520]">
                <h3 className="text-xl font-bold text-white">
                  {editingItem?.id ? "Edit Package" : "Add New Package"}
                </h3>
                <button onClick={closeModal} className="text-white/50 hover:text-white transition-colors bg-[#0A1F33] p-1.5 rounded-lg border border-[#14304A]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
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
                    <label className="text-sm font-bold text-white">Title (AR) *</label>
                    <input 
                      type="text" dir="rtl" 
                      value={formData.title_ar}
                      onChange={(e) => handleChange('title_ar', e.target.value)}
                      className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-white">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none appearance-none"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-white">Price From (EGP) *</label>
                    <input 
                      type="number" 
                      value={formData.price_from}
                      onChange={(e) => handleChange('price_from', parseInt(e.target.value) || 0)}
                      className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-white">Price To (EGP)</label>
                    <input 
                      type="number" 
                      value={formData.price_to ?? ""}
                      onChange={(e) => handleChange('price_to', e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-white">Price Note</label>
                  <input 
                    type="text" 
                    value={formData.price_note}
                    onChange={(e) => handleChange('price_note', e.target.value)}
                    className="w-full bg-[#061520] text-white/70 border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      id="popular" 
                      checked={formData.is_popular}
                      onChange={(e) => handleChange('is_popular', e.target.checked)}
                      className="w-5 h-5 accent-[#FFEE34] bg-[#061520] border-[#14304A] rounded" 
                    />
                    <label htmlFor="popular" className="font-bold text-white text-sm select-none">Is Popular Package</label>
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
