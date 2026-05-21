"use server";

import { cookies } from "next/headers";

import { COOKIE_CONSENT } from "@/integrations/consent";

const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === "production";

// Consent must survive across sessions and must be readable from client code
// for the consent banner, so `httpOnly` stays false. Everything else is the
// safe explicit default.
const COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax",
  secure: isProduction,
  maxAge: 60 * 60 * 24 * 365, // 1 year
} as const;

export const onAcceptCookiePolicy = async () => {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_CONSENT, "true", COOKIE_OPTIONS);
};

export const onRefuseCookiePolicy = async () => {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_CONSENT, "false", COOKIE_OPTIONS);
};
