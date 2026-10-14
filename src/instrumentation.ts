import * as Sentry from "@sentry/nextjs";

export async function register() {
  // `proxy.ts` runs on the Node.js runtime, so the former edge config is no
  // longer needed.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry/sentry.server.config");
  }
}

// Captures errors thrown while rendering React Server Components and routes.
export const onRequestError = Sentry.captureRequestError;
