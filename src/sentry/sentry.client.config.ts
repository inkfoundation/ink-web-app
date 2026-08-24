// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

import { clientEnv } from "../env-client";
import Consent, { ConsentType } from "../integrations/consent";

const integrations = [
  Sentry.replayIntegration({
    // Additional Replay configuration goes in here, for example:
    maskAllText: true,
    blockAllMedia: true,
  }),
  Sentry.breadcrumbsIntegration({
    console: false,
    dom: false,
    fetch: false,
    history: false,
    sentry: false,
    xhr: false,
  }),
];

Consent.on(ConsentType.CONSENT, () => {
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
