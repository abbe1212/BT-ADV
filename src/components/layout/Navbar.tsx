"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import StarField from "@/components/booking/StarField";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navHeight, setNavHeight] = useState(88);
  const navRef = useRef<HTMLElement>(null);
  const { t } = useLanguage();

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Measure real navbar height after scroll-driven transition completes
  useEffect(() => {
    const measure = () => {
      if (navRef.current) {
        setNavHeight(navRef.current.getBoundingClientRect().height);
      }
    };
    measure();
    const timer = setTimeout(measure, 350);
    return () => clearTimeout(timer);
  }, [isScrolled]);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
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
    <>
      {/* Navbar bar */}
      <nav
        ref={navRef}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-[#00101E]/95 backdrop-blur-md py-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]" : "bg-transparent py-6"
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
                    className="text-xs lg:text-sm font-medium text-white/80 hover:text-yellow transition-colors relative group whitespace-nowrap uppercase tracking-[0.05em] lg:tracking-wider rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <span className="text-white uppercase font-bold text-sm tracking-wider">menu</span>
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="text-white hover:text-yellow transition-colors p-2 -mr-2"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav-menu"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* 
        Mobile Menu Overlay — rendered OUTSIDE <nav> as a sibling.
        This avoids inheriting the nav's z-index stacking context.
        `top` is set via inline style using the measured navbar height
        so it always sits flush below the bar regardless of scroll state.
      */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-nav-menu"
            initial={{ opacity: 0, y: -12, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{ top: navHeight, zIndex: 9999 }}
            className="md:hidden fixed bottom-0 left-0 right-0 bg-[#00101E]/95 backdrop-blur-3xl border-t border-white/10 flex flex-col overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
          >
            {/* Starry animated background */}
            <div className="absolute inset-0 z-0 opacity-100 pointer-events-none">
              <StarField count={150} />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00101E]/60 to-[#00101E]" />
            </div>

            {/* Menu items */}
            <div className="relative z-10 flex-1 w-full overflow-y-auto pb-12">
              <ul className="flex flex-col py-4">
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.045 + 0.08, duration: 0.28 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex justify-center items-center px-6 py-5 text-white/80 hover:bg-white/5 hover:text-yellow active:bg-yellow/10 transition-all border-b border-white/5 last:border-0 uppercase tracking-[0.2em] text-sm font-semibold"
                    >
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
