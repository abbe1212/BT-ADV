"use client";

import { createContext, useContext, useCallback, useState, useEffect, ReactNode } from "react";
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
  // Default to "en" — renders immediately, no blank flash, no hydration mismatch.
  const [language, setLanguage] = useState<Language>("en");
  const [translations, setTranslations] = useState<Translations>(en);

  // After mount, silently switch to the user's saved preference if different.
  useEffect(() => {
    const saved = localStorage.getItem("bt-language") as Language;
    if (saved === "ar") {
      setLanguage("ar");
      setTranslations(ar);
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "ar";
    }
    // "en" is already the default — nothing to do.
  }, []);

  const toggleLanguage = useCallback(() => {
    const nextLang = language === "en" ? "ar" : "en";
    setLanguage(nextLang);
    setTranslations(nextLang === "en" ? en : ar);
    localStorage.setItem("bt-language", nextLang);
    document.documentElement.dir = nextLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = nextLang;
  }, [language]);

  // Memoised to avoid re-rendering all consumers when unrelated state changes.
  const t = useCallback((path: string): string => {
    const keys = path.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = translations;
    for (const key of keys) {
      if (current[key] === undefined) return path;
      current = current[key];
    }
    return current as string;
  }, [translations]);

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
