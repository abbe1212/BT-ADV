"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

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
            className="object-contain h-12 w-auto md:h-16 lg:h-20"
          />
          <span className="text-xl md:text-2xl lg:text-1xl font-bold tracking-widest text-white uppercase hidden sm:block">
            BT<span className="text-yellow">-</span>ADV
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-white/80 hover:text-yellow transition-colors relative group whitespace-nowrap uppercase tracking-wider"
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
        <div className="lg:hidden flex items-center gap-4">
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1 rounded border border-white/20 bg-white/5 hover:bg-yellow hover:border-yellow hover:text-navy text-white transition-all text-xs font-bold uppercase mr-2"
          >
            <Globe size={14} />
            {language === "en" ? "AR" : "EN"}
          </button>
          <span className="text-white uppercase font-bold text-sm tracking-wider">menu</span>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white hover:text-yellow transition-colors"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-navy border-t border-white/10 flex flex-col shadow-2xl">
          <ul className="flex flex-col py-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-6 py-4 text-white hover:bg-white/5 hover:text-yellow transition-colors border-b border-white/5 last:border-0 uppercase tracking-wider"
                >
                  {link.name}
                </Link>
              </li>
            ))}
            <li className="px-6 py-4">
              <button 
                onClick={toggleLanguage}
                className="flex items-center gap-2 text-yellow font-bold py-2 uppercase tracking-wider text-sm w-full"
              >
                <Globe size={18} />
                {language === "en" ? t("nav.switch_ar") : t("nav.switch_en")}
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
