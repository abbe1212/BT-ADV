import type { NextConfig } from "next";

// ─── Cache-Control header helper ─────────────────────────────────────────────
// s-maxage: how long Vercel's CDN edge caches the page (seconds)
// stale-while-revalidate: serve stale while Next.js revalidates in background
const STATIC_PAGE_CACHE = 'public, s-maxage=3600, stale-while-revalidate=86400';

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ['192.168.1.3'],

  // ─── HTTP Response Headers ─────────────────────────────────────────────────
  // These headers tell Vercel's CDN to cache ISR pages at the edge.
  // Under load, the CDN serves cached HTML → zero serverless invocations.
  async headers() {
    return [
      // ── Static / ISR pages — cache at Vercel edge ──────────────────────────
      {
        source: '/',
        headers: [{ key: 'Cache-Control', value: STATIC_PAGE_CACHE }],
      },
      {
        source: '/works',
        headers: [{ key: 'Cache-Control', value: STATIC_PAGE_CACHE }],
      },
      {
        source: '/pricing',
        headers: [{ key: 'Cache-Control', value: STATIC_PAGE_CACHE }],
      },
      {
        source: '/about',
        headers: [{ key: 'Cache-Control', value: STATIC_PAGE_CACHE }],
      },
      {
        source: '/bts',
        headers: [{ key: 'Cache-Control', value: STATIC_PAGE_CACHE }],
      },
      {
        source: '/careers',
        headers: [{ key: 'Cache-Control', value: STATIC_PAGE_CACHE }],
      },
      {
        source: '/booking',
        headers: [{ key: 'Cache-Control', value: STATIC_PAGE_CACHE }],
      },
      {
        source: '/teamwork',
        headers: [{ key: 'Cache-Control', value: STATIC_PAGE_CACHE }],
      },
      // ── Works detail pages ──────────────────────────────────────────────────
      {
        source: '/works/:slug*',
        headers: [{ key: 'Cache-Control', value: STATIC_PAGE_CACHE }],
      },
      // ── Client pages ────────────────────────────────────────────────────────
      {
        source: '/clients/:slug*',
        headers: [{ key: 'Cache-Control', value: STATIC_PAGE_CACHE }],
      },
      // ── API routes — never cache at CDN edge ────────────────────────────────
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
        ],
      },
    ];
  },

  // ─── Image optimisation ────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
      { protocol: "https", hostname: "th.bing.com" },
      { protocol: "https", hostname: "*.bing.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    qualities: [100, 75],
  },
};

export default nextConfig;

