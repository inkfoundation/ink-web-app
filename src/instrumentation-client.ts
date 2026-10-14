// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a user loads a page in their browser.
// Next.js runs this file before hydration; it replaces the legacy
// `sentry.client.config.ts` convention, which is not injected by Turbopack.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
// https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client

import * as Sentry from "@sentry/nextjs";

import Consent, { ConsentType } from "./integrations/consent";
import { clientEnv } from "./env-client";

const integrations = [
  Sentry.replayIntegration({
    // Additional Replay configuration goes in here, for example:
    maskAllText: true,
    blockAllMedia: true,
  }),
  Sentry.breadcrumbsIntegration({
    dom: false,
    fetch: false,
    history: false,
    sentry: false,
    xhr: false,
  }),
];

Consent.on(ConsentType.CONSENT, () => {
  // `Consent.fire` re-runs every registered callback on each consent change
  // (OneTrust's `OnConsentChanged`, the `?consent` query, the banner buttons),
  // but the SDK must only be initialised once per page.
  if (Sentry.getClient()) return;

  Sentry.init({
    dsn: clientEnv.NEXT_PUBLIC_SENTRY_DSN,
    enabled:
      Boolean(clientEnv.NEXT_PUBLIC_SENTRY_DSN) &&
      clientEnv.NEXT_PUBLIC_ENVIRONMENT !== "ci",

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 0.05,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    replaysOnErrorSampleRate: 1.0,

    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: 0.1,

    // You can remove this option if you're not planning to use the Sentry Session Replay feature:
    integrations: [...integrations],
  });
});

// Lets Sentry instrument App Router navigations as spans.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
