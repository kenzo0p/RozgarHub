// Frontend error monitoring — mirrors the backend captureException hook.
// Logs with a stable "[monitored]" marker now; ready to forward to a provider
// (Sentry: install @sentry/react, init in main.jsx with import.meta.env.VITE_SENTRY_DSN,
// and call Sentry.captureException inside the guarded block). No hard dependency.

export function captureException(error, context = {}) {
  const err = error instanceof Error ? error : new Error(String(error ?? "Unknown error"));
  console.error("[monitored]", err.message, { ...context, stack: err.stack });

  if (import.meta.env.VITE_SENTRY_DSN) {
    // Provider configured — forward here once @sentry/react is initialized:
    //   Sentry.captureException(err, { extra: context });
  }
}

let installed = false;

/**
 * Install global catch-alls for errors that escape React's render tree:
 * uncaught exceptions and unhandled promise rejections. Idempotent.
 */
export function initGlobalErrorHandlers() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (event) => {
    captureException(event.error || event.message, { source: "window.onerror" });
  });
  window.addEventListener("unhandledrejection", (event) => {
    captureException(event.reason, { source: "unhandledrejection" });
  });
}
