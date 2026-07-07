import { NextResponse } from "next/server";
import { z } from "zod";

import { env } from "@/env";
import { forwardRequestHeaders, forwardResponseHeaders } from "@/lib/proxy";

// Enhanced validation to only accept valid Ethereum addresses
const RequestParamsSchema = z.object({
  address: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Must be a valid Ethereum address"),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    // Validate the address parameter is a valid Ethereum address
    const { address } = RequestParamsSchema.parse(await params);

    const targetUrl = `${env.KRAKEN_VERIFY_API_BASE_URL}/v1/verifications/${address}`;

    const response = await fetch(targetUrl, {
      method: "GET",
      headers: forwardRequestHeaders(request.headers),
    });

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: forwardResponseHeaders(response.headers),
    });
  } catch (error) {
    console.error("Proxy error:", error);

    // Return a 400 status for validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid Ethereum address format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to proxy request" },
      { status: 500 }
    );
  }
}
