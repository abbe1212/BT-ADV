"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full bg-navy mt-auto border-t border-white/5 pt-16 pb-8 px-6 md:px-12 flex flex-col items-center">
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="inline-flex items-center gap-4 hover:opacity-80 transition-opacity w-fit">
            <Image 
              src="/logo.png" 
              alt="BT-ADV" 
              width={250} 
              height={100} 
              quality={100}
              className="object-contain h-16 md:h-20 w-auto"
            />
            <span className="text-2xl md:text-3xl font-bold tracking-widest text-white uppercase">
              Band<span className="text-yellow">-</span>Trend
            </span>
          </Link>
          <p className="text-white/60 text-sm max-w-sm">
            {t("footer.description")}
          </p>
          <div className="flex gap-4 mt-2">
            <a 
              href="https://www.instagram.com/bt.advertising.agency" 
              target="_blank" 
              rel="noreferrer" 
              className="text-white hover:text-yellow transition-colors font-bold text-sm tracking-widest uppercase flex items-center gap-1"
            >
              IG
            </a>
            <a 
              href="https://www.facebook.com/share/18UHCvKB16/" 
              target="_blank" 
              rel="noreferrer" 
              className="text-white hover:text-yellow transition-colors font-bold text-sm tracking-widest uppercase flex items-center gap-1"
            >
              FB
            </a>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-bold uppercase tracking-wider mb-2">{t("footer.navigation")}</h4>
          <ul className="grid grid-cols-2 gap-2 text-sm text-white/70">
            <li><Link href="/works" className="hover:text-yellow transition-colors">{t("nav.works")}</Link></li>
            <li><Link href="/pricing" className="hover:text-yellow transition-colors">{t("nav.pricing")}</Link></li>
            <li><Link href="/bts" className="hover:text-yellow transition-colors">{t("nav.bts")}</Link></li>
            <li><Link href="/teamwork" className="hover:text-yellow transition-colors">{t("nav.teamwork")}</Link></li>
            <li><Link href="/about" className="hover:text-yellow transition-colors">{t("nav.about")}</Link></li>
            <li><Link href="/careers" className="hover:text-yellow transition-colors">{t("nav.careers")}</Link></li>
            <li><Link href="/contact" className="hover:text-yellow transition-colors">{t("nav.contact")}</Link></li>
          </ul>
        </div>

        {/* Contact info placeholder */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-bold uppercase tracking-wider mb-2">{t("footer.connect")}</h4>
          <ul className="flex flex-col gap-3 text-sm text-white/70">
            <li className="flex items-center gap-3">
              <MapPin size={16} className="text-yellow" /> Cairo, Egypt (HQ)
            </li>
            <li className="flex items-center gap-3">
              <Phone size={16} className="text-yellow" /> +20 10 0000 0000
            </li>
            <li className="flex items-center gap-3">
              <Mail size={16} className="text-yellow" /> hello@btadv.agency
            </li>
          </ul>
        </div>
      </div>

      <div className="w-full max-w-7xl border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-white/40 uppercase tracking-widest gap-4">
        <p>© {new Date().getFullYear()} BT-ADV. {t("footer.rights")}</p>
        <p>{t("footer.slogan")}</p>
      </div>
    </footer>
  );
}
