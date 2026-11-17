/**
 * Content Security Policy for the documents served through `src/proxy.ts`.
 *
 * A script only runs if it carries the per-request nonce (everything Next.js
 * and our own components render) or is served from one of the hosts listed
 * below. `'strict-dynamic'` is left out on purpose: it would extend that trust
 * to whatever an allowed script injects, which is exactly how a compromised
 * third-party tag pulls in a remote skimmer.
 *
 * Adding a third-party script, iframe or stylesheet host means adding it here.
 */

/**
 * Report-only until the violation reports show the allowlist is complete.
 * To enforce, change this to `Content-Security-Policy`: Next.js reads the
 * nonce from either header, so nothing else has to change.
 */
export const CSP_HEADER = "Content-Security-Policy-Report-Only";

/** Request header carrying the nonce from the proxy to server components. */
export const NONCE_HEADER = "x-nonce";

const REPORT_GROUP = "csp-endpoint";

const isDevelopment = process.env.NODE_ENV === "development";
const isVercelPreview = process.env.VERCEL_ENV === "preview";

const SELF = "'self'";
const ONETRUST = "https://cdn.cookielaw.org";
const GOOGLE_TAG_MANAGER = "https://www.googletagmanager.com";
// Loaded by the Mixpanel tag in our GTM container.
const MIXPANEL = "https://cdn.mxpnl.com";
const HCAPTCHA = ["https://hcaptcha.com", "https://*.hcaptcha.com"];
const WALLETCONNECT_VERIFY = [
  "https://verify.walletconnect.com",
  "https://verify.walletconnect.org",
];
// "Contact us" survey (`ContactUsModal`).
const KRAKEN_SURVEYS = "https://surveys.kraken.com";
// Vercel injects its toolbar into preview deployments.
const VERCEL_TOOLBAR = isVercelPreview ? ["https://vercel.live"] : [];
const VERCEL_TOOLBAR_FONTS = isVercelPreview
  ? ["https://vercel.live", "https://assets.vercel.com"]
  : [];

const reportUri = getReportUri();

/**
 * `Reporting-Endpoints` response header value backing `report-to`. Send it
 * with every policy built with `reportViolations: true`.
 */
export const CSP_REPORTING_ENDPOINTS = reportUri
  ? `${REPORT_GROUP}="${reportUri}"`
  : undefined;

export function generateNonce(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(18))).toString(
    "base64"
  );
}

export function buildContentSecurityPolicy(
  nonce: string,
  { reportViolations }: { reportViolations: boolean }
): string {
  const directives: Record<string, string[]> = {
    "default-src": [SELF],
    "script-src": [
      SELF,
      `'nonce-${nonce}'`,
      // WebAssembly only; JS `eval` stays off. Wallet extensions compile
      // WebAssembly in the page context and break without it.
      "'wasm-unsafe-eval'",
      // Puts the first characters of a blocked inline script in the report.
      "'report-sample'",
      // React and Turbopack need `eval` for dev tooling only.
      ...(isDevelopment ? ["'unsafe-eval'"] : []),
      ONETRUST,
      GOOGLE_TAG_MANAGER,
      MIXPANEL,
      ...HCAPTCHA,
      ...VERCEL_TOOLBAR,
      // Segment is not listed: every destination runs in cloud mode, so
      // analytics.js loads no remote scripts. A device-mode destination would
      // need `https://cdn.segment.com`.
    ],
    // Inline styles come from React `style` props, framer-motion, RainbowKit
    // and the OneTrust banner, none of which can carry a nonce.
    "style-src": [SELF, "'unsafe-inline'", ...HCAPTCHA, ...VERCEL_TOOLBAR],
    // App, token and wallet icons are served from arbitrary hosts.
    "img-src": [SELF, "data:", "blob:", "https:"],
    "font-src": [SELF, ...VERCEL_TOOLBAR_FONTS],
    // Wallets, the Relay SDK and ENS lookups call RPC and API hosts that are
    // only known at runtime, so this cannot be a fixed list of hosts.
    "connect-src": [
      SELF,
      "https:",
      "wss:",
      ...(isDevelopment ? ["http:", "ws:"] : []),
    ],
    "media-src": [SELF],
    "frame-src": [
      ...HCAPTCHA,
      ...WALLETCONNECT_VERIFY,
      KRAKEN_SURVEYS,
      ...VERCEL_TOOLBAR,
    ],
    // Sentry Replay and lottie-web run workers created from blob URLs.
    "worker-src": [SELF, "blob:"],
    "object-src": ["'none'"],
    "base-uri": [SELF],
    "form-action": [SELF],
    "frame-ancestors": [SELF],
    // `report-to` only works together with the `Reporting-Endpoints` header.
    ...(reportViolations && reportUri
      ? { "report-uri": [reportUri], "report-to": [REPORT_GROUP] }
      : {}),
  };

  return Object.entries(directives)
    .map(([directive, sources]) => [directive, ...sources].join(" "))
    .join("; ");
}

/**
 * Violation reports go to the Sentry project the SDK already reports to, from
 * the same deployments: production builds with a DSN, outside CI.
 */
function getReportUri(): string | undefined {
  if (
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_ENVIRONMENT === "ci"
  ) {
    return undefined;
  }

  return getSentrySecurityReportUri(
    process.env.NEXT_PUBLIC_SENTRY_DSN,
    // Same default the Sentry SDK uses for server events.
    process.env.SENTRY_ENVIRONMENT ||
      process.env.VERCEL_TARGET_ENV ||
      process.env.VERCEL_ENV ||
      process.env.NODE_ENV
  );
}

/**
 * Derives Sentry's security report endpoint from a DSN
 * (`https://<publicKey>@<host>/<projectId>`). Returns `undefined` for a
 * missing or malformed DSN so a bad value can never break the policy.
 *
 * https://docs.sentry.io/security-legal-pii/security/security-policy-reporting/
 */
export function getSentrySecurityReportUri(
  dsn: string | undefined,
  environment?: string
): string | undefined {
  if (!dsn || !URL.canParse(dsn)) return undefined;

  const { protocol, username: publicKey, host, pathname } = new URL(dsn);
  const segments = pathname.split("/").filter(Boolean);
  const projectId = segments.pop();

  if (
    !/^https?:$/.test(protocol) ||
    !publicKey ||
    !projectId ||
    !/^\d+$/.test(projectId)
  ) {
    return undefined;
  }

  const endpoint = new URL(
    [
      `${protocol}//${host}`,
      ...segments,
      "api",
      projectId,
      "security",
      "",
    ].join("/")
  );
  endpoint.searchParams.set("sentry_key", publicKey);
  if (environment) {
    endpoint.searchParams.set("sentry_environment", environment);
  }

  // The URL is embedded in a CSP directive and a quoted header value.
  return /[\s;,"\\]/.test(endpoint.href) ? undefined : endpoint.href;
}
