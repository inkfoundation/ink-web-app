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

// The chain list is requested on every page load and rarely changes; prices
// and quotes must stay uncached.
const CDN_CACHEABLE_GET_PATHS = new Set(["chains"]);

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

  const isCdnCacheable =
    request.method === "GET" &&
    response.ok &&
    CDN_CACHEABLE_GET_PATHS.has(path.join("/"));

  return new NextResponse(response.body, {
    status: response.status,
    headers: {
      "content-type":
        response.headers.get("content-type") ?? "application/json",
      ...(isCdnCacheable && {
        "cdn-cache-control": "max-age=300, stale-while-revalidate=86400",
      }),
    },
  });
}

export { proxy as GET, proxy as POST };
