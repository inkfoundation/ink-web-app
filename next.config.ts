import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";
import { env } from "@/env";
import { clientEnv } from "@/env-client";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  images: {
    unoptimized: true,
  },
  // Inline the build commit SHA so it can be referenced via
  // `process.env.GITHUB_SHA` in server/client code without depending on the
  // runtime container env. Sourced from the docker build arg in CI, or from
  // Vercel's built-in commit SHA when building there.
  env: {
    GITHUB_SHA: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA,
  },
  // Keep `prettier` out of the server bundle: it relies on dynamic requires that
  // webpack can't statically analyze, and we use it at runtime in the
  // `submit-your-app` server action to format `apps-data.json` before opening a PR.
  serverExternalPackages: ["prettier"],
  experimental: {
    serverActions: {
      // Restricted from "*": on Vercel every preview deploy gets its own URL,
      // so a wildcard would let any origin drive our server actions.
      allowedOrigins: ["inkonchain.com", "*.inkonchain.com"],
      // Vercel enforces a hard 4.5MB request payload limit at the platform
      // layer (before Next.js runs), so anything above that is unreachable
      // there and fails silently. 4mb max image size + buffer for form data.
      bodySizeLimit: "4.5mb",
    },
  },
};

export default withSentryConfig(withNextIntl(nextConfig), {
  // For all available options, see node_modules/@sentry/nextjs/build/types/config/types.d.ts

  org: "payward-inc",
  project: "ink-web-app",
  authToken: env.SENTRY_AUTH_TOKEN,
  silent: true,

  // Sourcemaps config
  sourcemaps: {
    // Send source maps to Sentry, but do not include them in the client bundle
    deleteSourcemapsAfterUpload: true,
  },

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
});
