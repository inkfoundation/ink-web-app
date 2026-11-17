import { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

import { COOKIE_CONSENT } from "./integrations/consent";
import {
  buildContentSecurityPolicy,
  CSP_HEADER,
  CSP_REPORTING_ENDPOINTS,
  generateNonce,
  NONCE_HEADER,
} from "./util/csp";
import { routing } from "./routing";

export const locales = routing.locales;
export const defaultLocale = routing.defaultLocale;

// next-intl still calls this "middleware"; Next.js 16 renamed the file
// convention to `proxy` (Node.js runtime).
const routingMiddleware = createMiddleware(routing);
const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === "production";

export default function proxy(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  Array.from(searchParams.entries()).forEach(([key, value]) => {
    if (value === "true" || value === "false") {
      requestHeaders.set(`x-feature-flag-${key}`, value);
    }
  });

  // Violation reports are sent by the browser straight to Sentry, so they
  // follow the same consent as the Sentry SDK (`src/instrumentation-client.ts`).
  const reportViolations =
    request.cookies.get(COOKIE_CONSENT)?.value === "true";

  // next-intl forwards the request headers to the page render. Next.js takes
  // the nonce for its own inline scripts from the CSP request header, and the
  // root layout reads `x-nonce` for the scripts we render ourselves.
  const nonce = generateNonce();
  const contentSecurityPolicy = buildContentSecurityPolicy(nonce, {
    reportViolations,
  });
  // Next.js accepts the nonce from either CSP header name and checks the
  // enforcing one first, so a copy sent by the client must not get through.
  request.headers.delete("content-security-policy");
  request.headers.delete("content-security-policy-report-only");
  request.headers.set(NONCE_HEADER, nonce);
  request.headers.set(CSP_HEADER, contentSecurityPolicy);

  const response = routingMiddleware(request);

  response.headers.set(CSP_HEADER, contentSecurityPolicy);
  if (reportViolations && CSP_REPORTING_ENDPOINTS) {
    response.headers.set("Reporting-Endpoints", CSP_REPORTING_ENDPOINTS);
  }

  if (!isProduction) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  Array.from(requestHeaders.entries()).forEach(([key, value]) => {
    if (key.startsWith("x-feature-flag-")) {
      response.headers.set(key, value);
    }
  });

  return response;
}

// Configure matcher
export const config = {
  // Match all pathnames except for
  // - /api (API routes)
  // - /_next (Next.js internals)
  // - /_vercel (Vercel internals)
  // - /static (public files)
  // - /*.* (files with extensions)
  // - /monitoring (Sentry tunnel route)
  matcher: ["/", "/((?!api|_next|_vercel|monitoring|.*\\..*).*)"],
};
