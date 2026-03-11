import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const clientEnv = createEnv({
  client: {
    NEXT_PUBLIC_ENVIRONMENT: z
      .enum(["local", "development", "ci", "production"])
      .default("local"),
    NEXT_PUBLIC_SENTRY_DSN: z.string().min(1),
    NEXT_PUBLIC_GTM_ID: z.string().min(1),
    NEXT_PUBLIC_SEGMENT_WRITE_KEY: z.string().min(1),
    NEXT_PUBLIC_ONE_TRUST_ID: z.string().min(1),
    NEXT_PUBLIC_DUNE_API_BASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_WC_PROJECT_ID: z.string().min(1),
    NEXT_PUBLIC_HCAPTCHA_SITEKEY: z.string().min(1),
    NEXT_PUBLIC_FAUCET_API_URL: z.string().url(),
    NEXT_PUBLIC_VERIFY_EXPLORER_BASE_URL: z
      .string()
      .url()
      .default("https://explorer.inkonchain.com"),
    NEXT_PUBLIC_DISABLE_CAPTCHA: z
      .string()
      .optional()
      .transform((val) => val === "true"),
  },
  runtimeEnv: {
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
    NEXT_PUBLIC_SEGMENT_WRITE_KEY: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY,
    NEXT_PUBLIC_ONE_TRUST_ID: process.env.NEXT_PUBLIC_ONE_TRUST_ID,
    NEXT_PUBLIC_DUNE_API_BASE_URL: process.env.NEXT_PUBLIC_DUNE_API_BASE_URL,
    NEXT_PUBLIC_WC_PROJECT_ID: process.env.NEXT_PUBLIC_WC_PROJECT_ID,
    NEXT_PUBLIC_HCAPTCHA_SITEKEY: process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY,
    NEXT_PUBLIC_FAUCET_API_URL: process.env.NEXT_PUBLIC_FAUCET_API_URL,
    NEXT_PUBLIC_VERIFY_EXPLORER_BASE_URL:
      process.env.NEXT_PUBLIC_VERIFY_EXPLORER_BASE_URL,
    NEXT_PUBLIC_DISABLE_CAPTCHA: process.env.NEXT_PUBLIC_DISABLE_CAPTCHA,
  },
});
