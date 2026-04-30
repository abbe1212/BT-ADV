"use client";

import React, { useState } from "react";
import { Plus, Trash2, X, Crown, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useModalFocus } from "@/hooks/useModalFocus";
import type { AdminUser } from "@/lib/supabase/queries";

interface AdminsPageProps {
  initialAdmins: AdminUser[];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function AdminsPage({ initialAdmins }: AdminsPageProps) {
  const [admins] = useState<AdminUser[]>(initialAdmins);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isSuperAdmin = true;

  const closeModal = () => setIsModalOpen(false);
  const modalRef = useModalFocus({ isOpen: isModalOpen, onClose: closeModal });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-surface p-6 rounded-2xl border border-border-input">
        <div>
          <div className="text-xs text-white/50 mb-1 flex items-center gap-2">
            <span>Admin Dashboard</span>
            <span>/</span>
            <span className="text-white/80 shrink-0">Admins</span>
            <Crown className="w-3 h-3 text-yellow mb-0.5" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Manage Admins</h2>
          <p className="text-sm text-white/50">إدارة المشرفين (للمدير العام فقط)</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-yellow text-navy hover:bg-white transition-colors px-6 py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(255,238,52,0.3)]"
        >
          <Plus className="w-5 h-5" />
          <span>Invite Admin</span>
        </button>
      </div>

      <div className="bg-surface rounded-2xl border border-border-input overflow-hidden">
        {admins.length > 0 ? (
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-white/50 uppercase bg-surface-deep border-b border-border-input">
              <tr>
                <th className="px-6 py-4 font-medium">User Details</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Added On</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#14304A]">
              {admins.map((admin) => {
                const displayName = admin.name || admin.email || 'Unknown';
                const displayEmail = admin.email || 'No email';
                const isSuperAdminRole = admin.role === 'super_admin';
                const roleLabel = isSuperAdminRole ? 'SUPER ADMIN' : 'ADMIN';
                
                return (
                  <tr key={admin.id} className="hover:bg-[#0d2538] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${isSuperAdminRole ? 'bg-yellow text-navy' : 'bg-border-input text-white'}`}>
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white text-base leading-tight">{displayName}</p>
                          <p className="text-xs text-white/50">{displayEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
                        isSuperAdminRole 
                          ? 'bg-white/10 text-white border-white/20' 
                          : 'bg-yellow/10 text-yellow border-yellow/20'
                      }`}>
                        {roleLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/80">{formatDate(admin.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                      {isSuperAdmin && !isSuperAdminRole && (
                        <button className="flex items-center gap-2 justify-end text-red-500 hover:text-white hover:bg-red-500 ml-auto px-3 py-1.5 rounded transition-colors text-xs font-bold border border-red-500/30 w-fit">
                          <ShieldAlert className="w-3.5 h-3.5" /> Revoke Access
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-16 text-center text-white flex flex-col items-center">
            <h3 className="text-xl font-bold mb-2">أنت المدري الوحيد حالياً</h3>
          </div>
        )}
      </div>

      <AnimatePresence>
         {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
            
            <motion.div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="admins-modal-title"
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-surface rounded-2xl overflow-hidden shadow-2xl border-t-4 border-yellow flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-border-input bg-surface-deep">
                <h3 id="admins-modal-title" className="text-xl font-bold text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow" /> Invite Admin
                </h3>
                <button onClick={closeModal} aria-label="Close dialog" className="text-white/50 hover:text-white transition-colors bg-surface p-1.5 rounded-lg border border-border-input">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-white">Full Name</label>
                  <input type="text" className="w-full bg-surface-deep text-white border border-border-input rounded-lg px-4 py-2.5 focus:border-yellow focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-white">Email Address</label>
                  <input type="email" className="w-full bg-surface-deep text-white border border-border-input rounded-lg px-4 py-2.5 focus:border-yellow focus:outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-white">Assign Role</label>
                  <select className="w-full bg-surface-deep text-white border border-border-input rounded-lg px-4 py-2.5 focus:border-yellow focus:outline-none appearance-none">
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPER ADMIN">SUPER ADMIN</option>
                  </select>
                </div>
              </div>

              <div className="p-5 border-t border-border-input bg-surface-deep flex justify-end gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-white/70 hover:text-white font-bold transition-colors">Cancel</button>
                <button onClick={() => setIsModalOpen(false)} className="px-8 py-2.5 bg-yellow text-navy rounded-lg font-bold hover:bg-white transition-colors">Send Invite</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
