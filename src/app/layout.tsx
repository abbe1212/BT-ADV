import type { Metadata } from "next";
import { Inter, Cairo, Bebas_Neue } from "next/font/google";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  display: "swap",
});

const displayFont = Bebas_Neue({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BT-ADV - We Innovate Your Vision",
  description: "BT-ADV - Premium Media Production",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${cairo.variable} ${displayFont.variable}`}>
      <body className="min-h-screen flex flex-col antialiased overflow-x-hidden selection:bg-yellow selection:text-navy">
        <LanguageProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[300] focus:bg-yellow focus:text-navy focus:font-bold focus:uppercase focus:tracking-widest focus:text-xs focus:px-5 focus:py-3 focus:rounded focus:shadow-[0_0_20px_rgba(255,238,52,0.5)] focus:outline-none transition-all"
          >
            Skip to main content
          </a>
          {children}

          {/* ── WhatsApp Floating Button ───────────────────────────────────── */}
          <a
            href="https://wa.me/201067804027"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp"
            className="fixed bottom-6 right-6 z-[200] group"
          >
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 animate-ping" aria-hidden="true" />
            {/* Button */}
            <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] shadow-[0_4px_24px_rgba(37,211,102,0.45)] transition-transform duration-200 group-hover:scale-110">
              {/* WhatsApp SVG icon */}
              <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white" aria-hidden="true">
                <path d="M16.002 2.667C8.638 2.667 2.667 8.638 2.667 16c0 2.354.618 4.562 1.697 6.476L2.667 29.333l7.07-1.848A13.266 13.266 0 0 0 16.002 29.333C23.364 29.333 29.333 23.362 29.333 16S23.364 2.667 16.002 2.667Zm0 24c-2.168 0-4.194-.59-5.93-1.616l-.423-.253-4.195 1.097 1.118-4.086-.277-.44A10.616 10.616 0 0 1 5.333 16c0-5.882 4.787-10.667 10.669-10.667C21.883 5.333 26.667 10.118 26.667 16S21.883 26.667 16.002 26.667Zm5.846-7.987c-.32-.16-1.893-.934-2.186-1.04-.293-.107-.506-.16-.72.16-.213.32-.826 1.04-.013 1.254-.226.293-.453.32-.773.16-.32-.16-1.352-.499-2.574-1.587-.951-.847-1.593-1.894-1.78-2.214-.186-.32-.02-.493.14-.652.144-.143.32-.373.48-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.734-.986-2.374-.26-.622-.523-.538-.72-.548l-.613-.01c-.213 0-.56.08-.853.4-.293.32-1.12 1.094-1.12 2.668s1.147 3.094 1.307 3.308c.16.213 2.254 3.441 5.461 4.827.763.33 1.358.527 1.822.674.766.243 1.464.209 2.015.127.615-.092 1.893-.774 2.16-1.52.266-.747.266-1.387.186-1.52-.08-.134-.293-.214-.613-.374Z" />
              </svg>
            </span>
            {/* Tooltip */}
            <span className="absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap bg-[#0a1929] text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
              Chat on WhatsApp
            </span>
          </a>
        </LanguageProvider>
      </body>
    </html>
  );
}
