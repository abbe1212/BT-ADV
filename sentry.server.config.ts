/**
 * Sentry — Server-Side (Node.js) Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * Loaded in the Node.js runtime: API routes, Server Actions, Server Components.
 * Captures server-side errors, database timeouts, and slow API responses.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 100 % of server errors are traced — cost is low server-side.
  tracesSampleRate: 1.0,

  // Spot slow DB queries and cold-start latency in the performance dashboard.
  integrations: [
    Sentry.captureConsoleIntegration({ levels: ['error'] }),
  ],

  enabled: process.env.NODE_ENV === 'production',
  environment: process.env.NODE_ENV,

  // Suppress noisy "Expected server HTML to contain" hydration warnings.
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
});
