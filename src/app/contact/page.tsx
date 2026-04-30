"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { User, Mail, Phone, MessageSquare, MapPin, Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";
import { getCsrfToken } from "@/lib/csrf-client";

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export default function ContactPage() {
  const [form, setForm] = useState<FormData>({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": getCsrfToken(),
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to send message");
      }

      setStatus("success");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message ?? "Something went wrong");
    }
  };

  return (
    <main id="main-content" className="min-h-screen bg-navy flex flex-col items-center">
      <Navbar />

      <div className="w-full relative mt-24 py-16 bg-gradient-to-b from-surface-deep to-navy flex items-center justify-center">
        <h1 className="text-4xl md:text-6xl font-bold text-yellow uppercase tracking-widest font-display">
          Contact Us
        </h1>
      </div>

      <SectionWrapper className="pt-10 flex-1">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">

          {/* Info */}
          <div className="flex flex-col gap-8">
            <h2 className="text-2xl text-white font-bold uppercase tracking-widest mb-4">Let&apos;s Create Magic</h2>
            <div className="flex flex-col gap-6 text-white/80">
              <div className="flex items-start gap-4 p-6 bg-navy-light/50 border border-white/5 rounded-lg hover:border-yellow/30 transition-colors">
                <MapPin className="text-yellow shrink-0 mt-1" size={24} />
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-white uppercase tracking-wider text-sm">Headquarters</span>
                  <span>Cairo, Egypt</span>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 bg-navy-light/50 border border-white/5 rounded-lg hover:border-yellow/30 transition-colors">
                <Phone className="text-yellow shrink-0 mt-1" size={24} />
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-white uppercase tracking-wider text-sm">Direct Line</span>
                  <span>+20 10 0000 0000</span>
                  <span className="text-xs opacity-60">Mon-Fri 9am - 6pm EET</span>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 bg-navy-light/50 border border-white/5 rounded-lg hover:border-yellow/30 transition-colors">
                <Mail className="text-yellow shrink-0 mt-1" size={24} />
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-white uppercase tracking-wider text-sm">Email Us</span>
                  <span>info@btadv.agency</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-8 bg-surface-raised border border-white/10 rounded-xl shadow-2xl">
            <h3 className="text-xl text-yellow font-bold uppercase tracking-widest mb-2 border-b border-white/10 pb-4">
              Send a Transmission
            </h3>

            {/* Name */}
            <div className="flex flex-col gap-2">
              <label htmlFor="contact-name" className="text-xs font-semibold uppercase tracking-widest text-white/60">Name *</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                  className="w-full bg-navy-light/30 border border-white/20 p-4 pl-12 rounded focus:border-yellow focus:ring-1 focus:ring-yellow outline-none transition-colors text-white placeholder-white/30"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label htmlFor="contact-email" className="text-xs font-semibold uppercase tracking-widest text-white/60">Email *</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="jane@brand.com"
                  className="w-full bg-navy-light/30 border border-white/20 p-4 pl-12 rounded focus:border-yellow focus:ring-1 focus:ring-yellow outline-none transition-colors text-white placeholder-white/30"
                />
              </div>
            </div>

            {/* Phone — added to match contact_messages schema */}
            <div className="flex flex-col gap-2">
              <label htmlFor="contact-phone" className="text-xs font-semibold uppercase tracking-widest text-white/60">Phone</label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+20 10 0000 0000"
                  className="w-full bg-navy-light/30 border border-white/20 p-4 pl-12 rounded focus:border-yellow focus:ring-1 focus:ring-yellow outline-none transition-colors text-white placeholder-white/30"
                />
              </div>
            </div>

            {/* Message */}
            <div className="flex flex-col gap-2">
              <label htmlFor="contact-message" className="text-xs font-semibold uppercase tracking-widest text-white/60">Message *</label>
              <div className="relative">
                <MessageSquare size={18} className="absolute left-4 top-4 text-white/40" />
                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  required
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us about your next project..."
                  className="w-full bg-navy-light/30 border border-white/20 p-4 pl-12 rounded focus:border-yellow focus:ring-1 focus:ring-yellow outline-none transition-colors text-white placeholder-white/30"
                />
              </div>
            </div>

            {/* Error */}
            {status === "error" && (
              <p className="text-red-400 text-sm">{errorMsg}</p>
            )}

            {/* Success */}
            {status === "success" && (
              <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                <CheckCircle size={18} />
                Message sent! We&apos;ll be in touch soon.
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className="mt-4 bg-yellow text-navy font-bold py-4 rounded uppercase tracking-widest hover:shadow-[0_0_20px_rgba(255,238,52,0.8)] transition-all flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === "loading" ? (
                <><Loader2 size={18} className="animate-spin" /> Transmitting...</>
              ) : (
                <>Transmit <span className="text-xl leading-none group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform">🚀</span></>
              )}
            </button>
          </form>
        </div>
      </SectionWrapper>

      <Footer />
    </main>
  );
}
