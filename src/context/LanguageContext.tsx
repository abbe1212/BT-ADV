"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import en from "@/locales/en.json";
import ar from "@/locales/ar.json";

type Language = "en" | "ar";
type Translations = typeof en;

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [translations, setTranslations] = useState<Translations>(en);
  const [mounted, setMounted] = useState(false);

  // Mount logic to get saved language from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("bt-language") as Language;
    if (saved === "en" || saved === "ar") {
      setLanguage(saved);
      setTranslations(saved === "en" ? en : ar);
      document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = saved;
    }
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    const nextLang = language === "en" ? "ar" : "en";
    setLanguage(nextLang);
    setTranslations(nextLang === "en" ? en : ar);
    localStorage.setItem("bt-language", nextLang);
    document.documentElement.dir = nextLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = nextLang;
  };

  // Simple string path resolver: e.g. t("nav.home")
  const t = (path: string): string => {
    const keys = path.split(".");
    let current: any = translations;
    for (const key of keys) {
      if (current[key] === undefined) {
        return path; // Fallback to path key if translation is missing
      }
      current = current[key];
    }
    return current as string;
  };

  if (!mounted) {
    // Avoid hydration mismatch by not rendering until mounted
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, isRtl: language === "ar" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
