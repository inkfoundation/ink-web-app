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
  // runtime container env. Sourced from the docker build arg in CI.
  env: {
    GITHUB_SHA: process.env.GITHUB_SHA,
  },
  // Keep `prettier` out of the server bundle: it relies on dynamic requires that
  // webpack can't statically analyze, and we use it at runtime in the
  // `submit-your-app` server action to format `apps-data.json` before opening a PR.
  serverExternalPackages: ["prettier"],
  experimental: {
    serverActions: {
      // Keep CSRF protection on by relying on Next's default same-origin check.
      // Add additional production hosts here if we ever embed actions cross-origin.
      bodySizeLimit: "6mb", // 5mb max image size + 1mb buffer for other form data
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
