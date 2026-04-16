"use client";

import React, { useState, useCallback } from "react";
import { Plus, Edit2, Trash2, X, Briefcase, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Career } from "@/lib/supabase/types";
import { insertCareer, updateCareer, deleteCareer, type CareerInsert } from "@/actions/careers";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { toast } from "sonner";
import { useConfirm } from "@/providers/ConfirmProvider";

interface CareersPageProps {
  initialCareers: Career[];
}

const departments = ["Creative", "Production", "Marketing", "Tech", "Other"];
const jobTypes = ["Full-time", "Part-time", "Freelance"];

interface FormData {
  title_en: string;
  title_ar: string;
  department: string;
  type: string;
  description_en: string;
  description_ar: string;
  is_open: boolean;
}

const emptyForm: FormData = {
  title_en: "",
  title_ar: "",
  department: "Creative",
  type: "Full-time",
  description_en: "",
  description_ar: "",
  is_open: true,
};

export function CareersPage({ initialCareers }: CareersPageProps) {
  const [jobs, setJobs] = useState(initialCareers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Career | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { confirm } = useConfirm();
  
  const isAdmin = true;

  // Real-time subscription
  useRealtimeSubscription<Career>({
    table: 'careers',
    onInsert: useCallback((newJob: Career) => {
      setJobs(prev => [newJob, ...prev]);
    }, []),
    onUpdate: useCallback((updatedJob: Career) => {
      setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
    }, []),
    onDelete: useCallback(({ id }: { id: string }) => {
      setJobs(prev => prev.filter(j => j.id !== id));
    }, []),
  });

  const openModal = (item?: Career) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title_en: item.title_en || "",
        title_ar: item.title_ar,
        department: item.department,
        type: item.type,
        description_en: item.description_en || "",
        description_ar: item.description_ar || "",
        is_open: item.is_open,
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

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title_ar) {
      toast.error("Title (Arabic) is required");
      return;
    }

    setIsSaving(true);

    const payload: CareerInsert = {
      title_ar: formData.title_ar,
      title_en: formData.title_en || null,
      department: formData.department,
      type: formData.type,
      description_ar: formData.description_ar || null,
      description_en: formData.description_en || null,
      is_open: formData.is_open,
    };

    if (editingItem) {
      const { error } = await updateCareer({ id: editingItem.id, ...payload });
      if (error) {
        toast.error(`Failed to update: ${error}`);
        setIsSaving(false);
        return;
      }
      toast.success("Job updated successfully");
    } else {
      const { error } = await insertCareer(payload);
      if (error) {
        toast.error(`Failed to create: ${error}`);
        setIsSaving(false);
        return;
      }
      toast.success("Job opening created successfully");
    }

    setIsSaving(false);
    closeModal();
  };

  const handleDelete = async (job: Career) => {
    const isConfirmed = await confirm({
      title: "Delete Job Opening",
      message: `Are you sure you want to delete "${job.title_ar}"? This action cannot be undone.`,
      confirmText: "Delete",
      isDestructive: true,
    });
    if (!isConfirmed) return;
    setDeletingId(job.id);
    const { error } = await deleteCareer(job.id);
    setDeletingId(null);
    if (error) {
      toast.error(`Failed to delete: ${error}`);
    } else {
      toast.success("Job opening deleted");
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
            <span className="text-white/80">Careers</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Job Openings</h2>
          <p className="text-sm text-white/50">إدارة الوظائف المتاحة</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-[#FFEE34] text-[#00203C] hover:bg-white transition-colors px-6 py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(255,238,52,0.3)]"
        >
          <Plus className="w-5 h-5" />
          <span>Add Job Opening</span>
        </button>
      </div>

      <div className="bg-[#0A1F33] rounded-2xl border border-[#14304A] overflow-hidden">
        {jobs.length > 0 ? (
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-white/50 uppercase bg-[#061520] border-b border-[#14304A]">
              <tr>
                <th className="px-6 py-4 font-medium">Job Title</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#14304A]">
              {jobs.map((job) => (
                <tr 
                  key={job.id} 
                  className={`hover:bg-[#0d2538] transition-colors group ${deletingId === job.id ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <td className="px-6 py-4">
                    <p className="font-bold text-white text-base font-['Cairo']">{job.title_ar}</p>
                    <p className="text-xs text-white/50">{job.title_en}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      job.department === 'Creative' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                      job.department === 'Production' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                      job.department === 'Marketing' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                      job.department === 'Tech' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                      'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                    }`}>
                      {job.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/80">{job.type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${job.is_open ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      {job.is_open ? "Open" : "Closed"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(job)} className="p-1.5 bg-[#14304A] text-white hover:bg-[#FFEE34] hover:text-[#00203C] rounded transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {isAdmin && (
                      <button 
                        onClick={() => handleDelete(job)}
                        className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors"
                      >
                        {deletingId === job.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-16 text-center text-white flex flex-col items-center">
            <div className="w-16 h-16 bg-[#061520] rounded-full flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8 text-[#14304A]" />
            </div>
            <h3 className="text-xl font-bold mb-2">لا توجد وظائف متاحة حالياً</h3>
            <p className="text-sm text-white/50 mb-6">No jobs openings added yet.</p>
            <button onClick={() => openModal()} className="px-6 py-2 bg-[#FFEE34] text-[#00203C] rounded-lg font-bold hover:bg-white transition-colors">
              Add New Job Opening
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
         {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-xl bg-[#0A1F33] rounded-2xl overflow-hidden shadow-2xl border-t-4 border-[#FFEE34] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-[#14304A] bg-[#061520]">
                <h3 className="text-xl font-bold text-white">
                  {editingItem?.id ? "Edit Job" : "Add Job Opening"}
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
                    <label className="text-sm font-bold text-white">المسمى (عربي) *</label>
                    <input 
                      type="text" dir="rtl" 
                      value={formData.title_ar}
                      onChange={(e) => handleChange('title_ar', e.target.value)}
                      className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-white">Department</label>
                    <select 
                      value={formData.department}
                      onChange={(e) => handleChange('department', e.target.value)}
                      className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none appearance-none cursor-pointer"
                    >
                      {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-white">Job Type</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => handleChange('type', e.target.value)}
                      className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-2.5 focus:border-[#FFEE34] focus:outline-none appearance-none cursor-pointer"
                    >
                      {jobTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
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

                <div className="pt-2">
                  <div className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      id="isOpen" 
                      checked={formData.is_open}
                      onChange={(e) => handleChange('is_open', e.target.checked)}
                      className="w-5 h-5 accent-[#FFEE34] bg-[#061520] border-[#14304A] rounded" 
                    />
                    <label htmlFor="isOpen" className="font-bold text-white text-sm select-none">Is Open (Visible on site)</label>
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
