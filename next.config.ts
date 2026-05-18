import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs';


// Sharp must be external — it uses native bindings that cannot be bundled
const SERVER_EXTERNAL_PACKAGES = ['sharp'];

// ─── Cache-Control header helper ─────────────────────────────────────────────
// s-maxage: how long Vercel's CDN edge caches the page (seconds)
// stale-while-revalidate: serve stale while Next.js revalidates in background
const STATIC_PAGE_CACHE = 'public, s-maxage=3600, stale-while-revalidate=86400';

// ─── Security headers (P1.7 + P1.10) ────────────────────────────────────────
// Applied to ALL routes via source: '(/.*)'.
// CSP is environment-aware: dev adds 'unsafe-eval' (required by React / Turbopack
// for error overlays, hot reload, and stack-trace reconstruction).
// Production NEVER includes unsafe-eval.
const isDev = process.env.NODE_ENV === 'development';

const SECURITY_HEADERS = [
  // Prevent this site being embedded in iframes (clickjacking)
  { key: 'X-Frame-Options', value: 'DENY' },
  // Block MIME-type sniffing attacks
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Limit referrer info sent to other origins
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable browser features the site doesn't use
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  // Force HTTPS for 1 year; include subdomains
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // 'unsafe-eval' is required by React (Turbopack / error overlays) in dev.
      // It is intentionally omitted from production builds.
      isDev
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        : "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://res.cloudinary.com https://*.supabase.co https://*.supabase.in https://img.youtube.com",
      "media-src 'self' https://res.cloudinary.com",
      // Supabase Realtime uses WebSocket — wss:// must be explicitly allowed
      // Turbopack hot-reload uses ws://localhost in dev
      `connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co wss://*.supabase.in https://*.upstash.io https://*.ingest.sentry.io${isDev ? ' ws://localhost:*' : ''}`,
      // YouTube iframe for the hero showreel
      "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ['192.168.1.3'],

  // Sharp native bindings must not be bundled by Webpack/Turbopack
  serverExternalPackages: SERVER_EXTERNAL_PACKAGES,

  // ─── HTTP Response Headers ─────────────────────────────────────────────────
  async headers() {
    return [
      // ── Security headers on ALL routes (P1.7) ──────────────────────────────
      {
        source: '/(.*)',
        headers: SECURITY_HEADERS,
      },

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
      // [P1.6] Removed: placehold.co (dev placeholder only — use real images in prod)
      // [P1.5] Removed: th.bing.com and *.bing.com (bandwidth abuse vector)

      // Supabase Storage — media bucket public URLs
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      { protocol: "https", hostname: "*.supabase.in" },

      // Cloudinary delivery — logos, works, and any transformed assets
      // pathname is intentionally unrestricted: allows any cloud account
      // (needed if the project migrates between Cloudinary accounts)
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    // Serve AVIF first (smallest), fall back to WebP, then original
    formats: ['image/avif', 'image/webp'],
    // Content-addressed filenames never change → safe to cache for 1 year
    minimumCacheTTL: 31536000,
    // Responsive breakpoints aligned to common device widths
    deviceSizes: [320, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // [P1.7] Removed quality: 100 — lossless wastes bandwidth; 90 is visually identical
    qualities: [90, 85, 75, 70],
  },
};

export default withSentryConfig(nextConfig, {
  // Source map upload — set SENTRY_AUTH_TOKEN in Vercel env vars.
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Upload source maps and delete them from the server bundle after upload.
  widenClientFileUpload: true,
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
  disableLogger: true,

  // Automatically instrument Next.js data fetching hooks.
  automaticVercelMonitors: true,
});
