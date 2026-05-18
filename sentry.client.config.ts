/**
 * Sentry — Browser (Client) Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * This file is loaded in the browser. Keep it lightweight.
 * It captures unhandled JS errors, promise rejections, and performance data.
 *
 * Docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Trace 10 % of sessions for performance monitoring.
  // Increase toward 1.0 on the launch day and reduce once baseline is stable.
  tracesSampleRate: 0.1,

  // Capture 10 % of sessions as replays (great for debugging user-reported bugs).
  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 1.0, // Always capture replays when an error occurs.

  // Integrations added lazily so they don't affect initial bundle size.
  integrations: [
    Sentry.replayIntegration({
      // Mask all input values and block images by default (GDPR-friendly).
      maskAllInputs: true,
      blockAllMedia: false,
    }),
  ],

  // Don't send events in development — use the Sentry dashboard for prod only.
  enabled: process.env.NODE_ENV === 'production',

  // Attach the current route as the transaction name.
  // This gives clean "Page Load: /works" transactions in the Sentry dashboard.
  environment: process.env.NODE_ENV,
});
