import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    CI: z.string().optional(),
    SENTRY_AUTH_TOKEN: z.string().optional(),
    ORIGIN: z.string().min(1).default("inkonchain.com"),
    KRAKEN_VERIFY_API_BASE_URL: z
      .string()
      .url()
      .default("http://localhost:8002"),
    BRAZE_INSTANCE_URL: z.string().url(),
    BRAZE_API_KEY: z.string().min(1),
    BRAZE_GENERAL_WAITLIST_GROUP_ID: z.string().min(1),
    BRAZE_DEVELOPERS_WAITLIST_GROUP_ID: z.string().min(1),
    INK_APP_SUBMISSION_BOT_GITHUB_APP_ID: z.string().min(1),
    INK_APP_SUBMISSION_BOT_GITHUB_PRIVATE_KEY: z.string().min(1),
    INK_APP_SUBMISSION_BOT_GITHUB_INSTALLATION_ID: z.string().min(1),
    INK_APP_SUBMISSION_SLACK_BOT_TOKEN: z.string().min(1),
    INK_APP_SUBMISSION_TARGET_ORG: z.string().min(1),
    INK_APP_SUBMISSION_TARGET_REPO: z.string().min(1),
    INK_APP_SUBMISSION_TARGET_BRANCH: z.string().min(1),
    INK_APP_SUBMISSION_SLACK_NOTIFICATION_CHANNEL: z.string().min(1),
    HCAPTCHA_SECRET: z.string().min(1),
    MULTIPLIER_JWT_SECRET: z.string().min(1),
    UNSUBSCRIBE_JWT_SECRET: z.string().min(1),
    BRAZE_CONNECTED_CONTENT_API_KEY: z.string().min(1),
    DUNE_API_KEY: z.string().min(1),
  },
  experimental__runtimeEnv: process.env,
});
