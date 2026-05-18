/**
 * Next.js Instrumentation Hook
 * ─────────────────────────────────────────────────────────────────────────────
 * This file is loaded once per Node.js process startup.
 * We use it to initialise Sentry for the correct runtime.
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 * ─────────────────────────────────────────────────────────────────────────────
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}
