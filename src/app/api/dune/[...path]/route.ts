import { NextRequest, NextResponse } from "next/server";

import { env } from "@/env";

const API_MAPPINGS = {
  "api/echo/v1/balances/evm": "v1/evm/balances",
  "api/echo/beta2/balances/svm": "beta/svm/balances",
} as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const DUNE_API_KEY = env.DUNE_API_KEY;
  const cache = 60;

  // Handle CORS
  const origin = request.headers.get("origin") || "";
  const allowedOrigins = [
    "https://inkonchain.com",
    "https://www.inkonchain.com",
    ...(process.env.NODE_ENV === "development"
      ? ["http://localhost:3000"]
      : []),
  ];

  const corsHeaders = {
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin)
      ? origin
      : "",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, x-sim-api-key",
    Vary: "Origin",
  };

  const resolvedParams = await params;
  const path = resolvedParams.path.join("/");
  const searchParams = request.nextUrl.searchParams.toString();
  const fullPath = searchParams ? `${path}?${searchParams}` : path;

  const newPath = Object.entries(API_MAPPINGS).reduce(
    (acc, [oldPath, newPath]) => acc.replace(oldPath, newPath),
    fullPath
  );

  let modifiedPath = newPath;
  const chainIdsMatch = modifiedPath.match(/chain_ids=([^&]*)/);
  if (chainIdsMatch && chainIdsMatch[1].includes("mainnet")) {
    // Only append if not already present
    if (!chainIdsMatch[1].includes("747474")) {
      const newChainIds = chainIdsMatch[1] + ",747474";
      modifiedPath = modifiedPath.replace(
        /chain_ids=([^&]*)/,
        `chain_ids=${newChainIds}`
      );
    }
  }

  const cleanPath = modifiedPath.startsWith("/")
    ? modifiedPath
    : `/${modifiedPath}`;
  const url = `https://api.sim.dune.com${cleanPath}`;

  if (!DUNE_API_KEY) {
    return NextResponse.json(
      { message: "Dune API key not configured" },
      { status: 500, headers: corsHeaders }
    );
  }

  try {
    const duneResponse = await fetch(url, {
      headers: {
        "X-Sim-Api-Key": DUNE_API_KEY,
      },
    });

    if (!duneResponse.ok) {
      const errorText = await duneResponse.text();
      console.error(`Dune API error (${duneResponse.status}):`, errorText);
      throw new Error(`Dune API responded with status: ${duneResponse.status}`);
    }

    const response = await duneResponse.json();

    const cacheHeaders = {
      "Cache-Control": `public, s-maxage=${cache}`,
      "CDN-Cache-Control": `public, s-maxage=${cache}`,
      "Vercel-CDN-Cache-Control": `public, s-maxage=${cache}`,
    };

    return NextResponse.json(response, {
      headers: { ...corsHeaders, ...cacheHeaders },
    });
  } catch (error) {
    console.error("Dune API proxy error:", error);
    return NextResponse.json(
      { message: "Failed to fetch from Dune API" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get("origin") || "";
  const allowedOrigins = [
    "https://inkonchain.com",
    "https://www.inkonchain.com",
    ...(process.env.NODE_ENV === "development"
      ? ["http://localhost:3000"]
      : []),
  ];

  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": allowedOrigins.includes(origin)
        ? origin
        : "",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, x-sim-api-key",
      Vary: "Origin",
    },
  });
}
