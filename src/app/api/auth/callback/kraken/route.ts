import { NextResponse } from "next/server";

import { clientEnv } from "@/env-client";

const isProduction = clientEnv.NEXT_PUBLIC_ENVIRONMENT === "production";

const ALLOWED_DOMAINS = [
  "inkonchain.com",
  "preview1.inkonchain.com",
  "preview2.inkonchain.com",
  ...(isProduction ? [] : ["localhost:3000"]),
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      throw new Error("Missing code or state parameters");
    }

    const host = request.headers.get("host");

    const isAllowedHost = ALLOWED_DOMAINS.some(
      (domain) => host === domain || host?.endsWith(`.${domain}`)
    );

    const baseUrl = isAllowedHost
      ? `https://${host}`
      : "https://inkonchain.com";

    const redirectUrl = new URL("/verify", baseUrl);
    redirectUrl.searchParams.set("code", code);
    redirectUrl.searchParams.set("state", state);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    const redirectUrl = new URL("/verify", "https://inkonchain.com");

    return NextResponse.redirect(redirectUrl);
  }
}
