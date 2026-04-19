"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import StarField from "@/components/booking/StarField";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.works"), href: "/works" },
    { name: t("nav.clients"), href: "/clients" },
    { name: t("nav.pricing"), href: "/pricing" },
    { name: t("nav.bts"), href: "/bts" },
    { name: t("nav.teamwork"), href: "/teamwork" },
    { name: t("nav.about"), href: "/about" },
    { name: t("nav.careers"), href: "/careers" },
    { name: t("nav.contact"), href: "/contact" },
  ];

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-navy/95 backdrop-blur-md py-4 shadow-lg" : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image 
            src="/logo.png" 
            alt="BT-ADV" 
            width={250} 
            height={100} 
            quality={100}
            className="object-contain h-10 w-auto md:h-14 lg:h-20"
          />
          <span className="text-base md:text-lg lg:text-2xl font-bold tracking-widest text-white uppercase">
            BT<span className="text-yellow">-</span>ADV
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-3 lg:gap-8">
          <ul className="flex items-center gap-2 lg:gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-xs lg:text-sm font-medium text-white/80 hover:text-yellow transition-colors relative group whitespace-nowrap uppercase tracking-[0.05em] lg:tracking-wider"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="h-6 w-px bg-white/20"></div>

          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 hover:bg-yellow hover:border-yellow hover:text-navy text-white transition-all text-sm font-bold tracking-wider uppercase group"
          >
            <Globe size={16} className="group-hover:animate-pulse" />
            {language === "en" ? "AR" : "EN"}
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-2 rounded border border-white/20 bg-white/5 hover:bg-yellow hover:border-yellow hover:text-navy text-white transition-all text-xs font-bold uppercase mr-2"
            aria-label={`Switch to ${language === "en" ? "Arabic" : "English"}`}
          >
            <Globe size={14} />
            {language === "en" ? "AR" : "EN"}
          </button>
          <span className="text-white uppercase font-bold text-sm tracking-wider">menu</span>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white hover:text-yellow transition-colors p-2 -mr-2"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav-menu"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            id="mobile-nav-menu" 
            initial={{ opacity: 0, y: -10, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="md:hidden fixed top-[80px] bottom-0 left-0 w-full bg-navy/80 backdrop-blur-3xl border-t border-white/10 flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Dynamic Starry Liquid Glass Background */}
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none mix-blend-screen">
               <StarField />
               <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy/50 to-navy shadow-inner"></div>
            </div>

            <div className="relative z-10 flex-1 w-full overflow-y-auto no-scrollbar pb-[100px]">
              <ul className="flex flex-col py-6 min-h-max">
              {navLinks.map((link, i) => (
                <motion.li 
                  key={link.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 + 0.1, duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex justify-center items-center px-6 py-4 text-white/80 hover:bg-white/5 hover:text-yellow transition-all border-b border-white/5 last:border-0 uppercase tracking-[0.2em] text-sm font-medium hover:tracking-[0.3em]"
                  >
                    {link.name}
                  </Link>
                </motion.li>
              ))}
              <motion.li 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: navLinks.length * 0.05 + 0.2, duration: 0.3 }}
                className="px-6 py-8 flex justify-center"
              >
                <button 
                  onClick={() => {
                    toggleLanguage();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 text-navy bg-yellow hover:bg-white hover:text-navy transition-all px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(255,238,52,0.2)] hover:shadow-[0_0_30px_rgba(255,238,52,0.6)] w-auto min-w-[200px]"
                >
                  <Globe size={16} />
                  {language === "en" ? t("nav.switch_ar") : t("nav.switch_en")}
                </button>
              </motion.li>
            </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
