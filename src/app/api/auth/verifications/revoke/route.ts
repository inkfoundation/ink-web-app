import { NextResponse } from "next/server";

import { env } from "@/env";
import { forwardRequestHeaders, forwardResponseHeaders } from "@/lib/proxy";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(
      `${env.KRAKEN_VERIFY_API_BASE_URL}/v1/verifications/revoke`,
      {
        method: "POST",
        headers: forwardRequestHeaders(request.headers),
        body: JSON.stringify(body),
      }
    );

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: forwardResponseHeaders(response.headers),
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to proxy request" },
      { status: 500 }
    );
  }
}
