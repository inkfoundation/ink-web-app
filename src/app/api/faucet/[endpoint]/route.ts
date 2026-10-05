import { NextRequest, NextResponse } from "next/server";

import { clientEnv } from "@/env-client";

const ALLOWED_ENDPOINTS = new Set(["check-rate-limit", "claim"]);

async function proxyFaucetRequest(
  request: NextRequest,
  { params }: { params: Promise<{ endpoint: string }> }
) {
  const { endpoint } = await params;

  if (!ALLOWED_ENDPOINTS.has(endpoint)) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const targetUrl = new URL(
    `/api/${endpoint}`,
    clientEnv.NEXT_PUBLIC_FAUCET_API_URL
  );
  targetUrl.search = request.nextUrl.search;

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "content-type":
          request.headers.get("content-type") ?? "application/json",
      },
      body: await request.text(),
      cache: "no-store",
    });

    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        "content-type":
          response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    console.error(`Faucet API ${endpoint} request failed:`, error);
    return NextResponse.json(
      {
        message: "Faucet is temporarily unavailable. Please try again later.",
      },
      { status: 502 }
    );
  }
}

export { proxyFaucetRequest as POST };
