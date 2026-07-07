"use server";

import { cookies } from "next/headers";

const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === "production";

// Theme must be readable from client code (next-themes), so `httpOnly` stays
// false. Everything else is the safe explicit default.
const COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax",
  secure: isProduction,
  maxAge: 60 * 60 * 24 * 365, // 1 year
} as const;

export const setTheme = async (theme: string) => {
  const cookieStore = await cookies();
  cookieStore.set("__theme__", theme, COOKIE_OPTIONS);
};
