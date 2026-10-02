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

/**
 * Only the endpoints the relay-kit widget actually calls are forwarded.
 * Because the key is attached server-side, an open catch-all would let anyone
 * reach key-scoped account endpoints (e.g. `/metrics/usage`, which echoes the
 * key back in its response body) and spend our rate limit on arbitrary
 * routes. Anything not listed here is rejected before reaching Relay.
 *
 * Sources: @reservoir0x/relay-kit-hooks hooks, relay-sdk actions, and the
 * `check`/`post` step endpoints returned by `/quote`.
 */
const ALLOWED_ROUTES: Record<string, ReadonlySet<string>> = {
  chains: new Set(["GET"]),
  "config/v2": new Set(["GET"]),
  "currencies/v2": new Set(["POST"]),
  "currencies/token/price": new Set(["GET"]),
  "currencies/trending": new Set(["GET"]),
  price: new Set(["POST"]),
  quote: new Set(["POST"]),
  "requests/v2": new Set(["GET"]),
  "requests/metadata": new Set(["POST"]),
  "intents/status": new Set(["GET"]),
  "intents/status/v2": new Set(["GET"]),
  "intents/status/v3": new Set(["GET"]),
  "transactions/index": new Set(["POST"]),
  "transactions/single": new Set(["POST"]),
  "execute/permits": new Set(["POST"]),
};

// `GET /app-fees/:wallet/balances` is the only parameterised route the SDK uses.
const APP_FEES_BALANCES = /^app-fees\/[A-Za-z0-9]+\/balances$/;

function isAllowed(joinedPath: string, method: string): boolean {
  const allowedMethods = ALLOWED_ROUTES[joinedPath];
  if (allowedMethods) {
    return allowedMethods.has(method);
  }
  return method === "GET" && APP_FEES_BALANCES.test(joinedPath);
}

async function proxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const joinedPath = path.join("/");

  if (!isAllowed(joinedPath, request.method)) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const search = request.nextUrl.search;
  const targetUrl = `${RELAY_API_URL}/${joinedPath}${search}`;

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
