import { NextRequest, NextResponse } from "next/server";

import { env } from "@/env";

/**
 * Proxy for the Relay API (https://docs.relay.link/references/api/api-keys#proxy-api).
 *
 * The swap widget runs in the browser, but the Relay API key must not be
 * shipped to the client. The widget's `baseApiUrl` points here, and we
 * forward requests to Relay with the `x-api-key` header attached.
 */
const RELAY_API_URL = "https://api.relay.link";

async function proxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const search = request.nextUrl.search;
  const targetUrl = `${RELAY_API_URL}/${path.join("/")}${search}`;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }
  if (env.RELAY_API_KEY) {
    headers.set("x-api-key", env.RELAY_API_KEY);
  }

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body:
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.text(),
    cache: "no-store",
  });

  return new NextResponse(response.body, {
    status: response.status,
    headers: {
      "content-type":
        response.headers.get("content-type") ?? "application/json",
    },
  });
}

export { proxy as GET, proxy as POST };
