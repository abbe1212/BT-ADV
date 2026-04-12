"use client";

import React, { useState, useCallback } from "react";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { updateSiteSettings } from "@/lib/supabase/mutations";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { toast } from "sonner";

interface SettingsPageProps {
  initialSettings: Record<string, string>;
}

// Setting keys that map to form fields
const SETTING_KEYS = {
  phone: 'contact_phone',
  email: 'contact_email',
  instagram: 'social_instagram',
  facebook: 'social_facebook',
  tagline_en: 'tagline_en',
  tagline_ar: 'tagline_ar',
} as const;

export function SettingsPage({ initialSettings }: SettingsPageProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [settings, setSettings] = useState<Record<string, string>>({
    [SETTING_KEYS.phone]: initialSettings[SETTING_KEYS.phone] || '+20 100 123 4567',
    [SETTING_KEYS.email]: initialSettings[SETTING_KEYS.email] || 'contact@btagency.com',
    [SETTING_KEYS.instagram]: initialSettings[SETTING_KEYS.instagram] || 'https://instagram.com/bt.agency',
    [SETTING_KEYS.facebook]: initialSettings[SETTING_KEYS.facebook] || 'https://facebook.com/bt.agency',
    [SETTING_KEYS.tagline_en]: initialSettings[SETTING_KEYS.tagline_en] || 'We Innovate Your Vision',
    [SETTING_KEYS.tagline_ar]: initialSettings[SETTING_KEYS.tagline_ar] || 'نبتكر رؤيتك',
  });

  // Real-time subscription for site settings
  useRealtimeSubscription<{ key: string; value: string; id: string }>({
    table: 'site_settings',
    onUpdate: useCallback((updated: { key: string; value: string }) => {
      setSettings(prev => ({ ...prev, [updated.key]: updated.value }));
    }, []),
    onInsert: useCallback((inserted: { key: string; value: string }) => {
      setSettings(prev => ({ ...prev, [inserted.key]: inserted.value }));
    }, []),
  });

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await updateSiteSettings(settings);
    setIsSaving(false);
    
    if (error) {
      toast.error(`Failed to save: ${error}`);
    } else {
      toast.success('Settings updated successfully');
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="text-xs text-white/50 mb-1 flex items-center gap-2">
            <span>Admin Dashboard</span>
            <span>/</span>
            <span className="text-white/80">Site Settings</span>
          </div>
          <h2 className="text-xl font-bold text-white">Site Settings / الإعدادات</h2>
        </div>
      </div>

      <div className="bg-[#0A1F33] rounded-2xl border border-[#14304A] overflow-hidden">
        <div className="p-8 space-y-10">
          
          {/* Contact Info */}
          <section className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-[#FFEE34] mb-1">Contact Information</h3>
              <p className="text-xs text-white/50">معلومات التواصل الأساسية</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-white flex justify-between">
                  <span>Phone Number</span>
                  <span className="text-white/50 text-xs">رقم الهاتف</span>
                </label>
                <input 
                  type="text" 
                  value={settings[SETTING_KEYS.phone]} 
                  onChange={(e) => handleChange(SETTING_KEYS.phone, e.target.value)}
                  className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-3 focus:outline-none focus:border-[#FFEE34] transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-white flex justify-between">
                  <span>Email Address</span>
                  <span className="text-white/50 text-xs">البريد الإلكتروني</span>
                </label>
                <input 
                  type="email" 
                  value={settings[SETTING_KEYS.email]} 
                  onChange={(e) => handleChange(SETTING_KEYS.email, e.target.value)}
                  className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-3 focus:outline-none focus:border-[#FFEE34] transition-all" 
                />
              </div>
            </div>
          </section>

          <hr className="border-[#14304A]" />

          {/* Social Media */}
          <section className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-[#FFEE34] mb-1">Social Media</h3>
              <p className="text-xs text-white/50">روابط منصات التواصل الاجتماعي</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-white flex justify-between">
                  <span>Instagram URL</span>
                  <span className="text-white/50 text-xs">انستجرام</span>
                </label>
                <input 
                  type="url" 
                  value={settings[SETTING_KEYS.instagram]} 
                  onChange={(e) => handleChange(SETTING_KEYS.instagram, e.target.value)}
                  className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-3 focus:outline-none focus:border-[#FFEE34] transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-white flex justify-between">
                  <span>Facebook URL</span>
                  <span className="text-white/50 text-xs">فيسبوك</span>
                </label>
                <input 
                  type="url" 
                  value={settings[SETTING_KEYS.facebook]} 
                  onChange={(e) => handleChange(SETTING_KEYS.facebook, e.target.value)}
                  className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-3 focus:outline-none focus:border-[#FFEE34] transition-all" 
                />
              </div>
            </div>
          </section>

          <hr className="border-[#14304A]" />

          {/* Site Content */}
          <section className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-[#FFEE34] mb-1">Site Content</h3>
              <p className="text-xs text-white/50">محتوى وعناوين الموقع</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-white flex justify-between">
                  <span>Tagline (English)</span>
                </label>
                <input 
                  type="text" 
                  value={settings[SETTING_KEYS.tagline_en]} 
                  onChange={(e) => handleChange(SETTING_KEYS.tagline_en, e.target.value)}
                  className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-3 focus:outline-none focus:border-[#FFEE34] transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-white flex justify-between">
                  <span className="text-white/50 text-xs">(عربي)</span>
                  <span>الشعار النصي</span>
                </label>
                <input 
                  type="text" 
                  dir="rtl" 
                  value={settings[SETTING_KEYS.tagline_ar]} 
                  onChange={(e) => handleChange(SETTING_KEYS.tagline_ar, e.target.value)}
                  className="w-full bg-[#061520] text-white border border-[#14304A] rounded-lg px-4 py-3 focus:outline-none focus:border-[#FFEE34] transition-all" 
                />
              </div>
            </div>
          </section>
        </div>

        <div className="p-6 bg-[#061520] border-t border-[#14304A]">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-4 bg-[#FFEE34] text-[#00203C] rounded-xl font-bold text-lg hover:bg-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : "Save Changes / حفظ التعديلات"}
          </button>
        </div>
      </div>
    </div>
  );
}

