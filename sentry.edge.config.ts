/**
 * Sentry — Edge Runtime Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * Loaded in the Edge runtime: Next.js Middleware.
 * Keep this minimal — the Edge runtime has strict size limits.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  enabled: process.env.NODE_ENV === 'production',
  environment: process.env.NODE_ENV,
});
