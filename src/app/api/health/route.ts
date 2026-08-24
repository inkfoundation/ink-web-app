import { NextRequest, NextResponse } from "next/server";

import { clientEnv } from "@/env-client";

// Health check timeout in milliseconds
const HEALTH_CHECK_TIMEOUT_MS = 5000;

interface ServiceStatus {
  status: "healthy" | "unhealthy";
  responseTime?: number;
  error?: string;
}

interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  services: {
    app: ServiceStatus;
    faucetApi?: ServiceStatus;
  };
}

async function checkServiceHealth(
  url: string,
  timeout: number = HEALTH_CHECK_TIMEOUT_MS
): Promise<ServiceStatus> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Ink-WebApp-HealthCheck/1.0",
      },
    });
    const responseTime = Date.now() - startTime;

    clearTimeout(timeoutId);

    if (response.ok) {
      return {
        status: "healthy",
        responseTime,
      };
    } else {
      return {
        status: "unhealthy",
        responseTime,
        error: `HTTP ${response.status}`,
      };
    }
  } catch (error) {
    clearTimeout(timeoutId);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`Health check failed for ${url}:`, errorMessage);
    return {
      status: "unhealthy",
      error: errorMessage,
    };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const deep = searchParams.get("deep") === "true";

  const healthResponse: HealthResponse = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      app: { status: "healthy", responseTime: 0 },
    },
  };

  if (deep) {
    const [faucetResult] = await Promise.allSettled([
      checkServiceHealth(clientEnv.NEXT_PUBLIC_FAUCET_API_URL || ""),
    ]);

    if (faucetResult.status === "fulfilled") {
      healthResponse.services.faucetApi = faucetResult.value;
    } else {
      console.error("Faucet API health check failed:", faucetResult.reason);
      healthResponse.services.faucetApi = {
        status: "unhealthy",
        error: "Health check failed",
      };
    }

    const nonCriticalServicesUnhealthy =
      healthResponse.services.faucetApi?.status === "unhealthy";

    if (nonCriticalServicesUnhealthy) {
      healthResponse.status = "degraded";
    }
  }

  const httpStatus = healthResponse.status === "unhealthy" ? 503 : 200;

  return NextResponse.json(healthResponse, {
    status: httpStatus,
    headers: {
      "Cache-Control": "no-cache",
    },
  });
}
