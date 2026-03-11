import { NextRequest, NextResponse } from "next/server";

import { env } from "@/env";
import { generateUnsubscribeToken } from "@/lib/unsubscribe-token";

// Braze Connected Content IP ranges
// Reference: https://www.braze.com/docs/user_guide/personalization_and_dynamic_content/connected_content/making_an_api_call
const BRAZE_IP_RANGES = [
  // US Instances (US-01 to US-07)
  "23.21.118.191",
  "34.206.23.173",
  "50.16.249.9",
  "52.4.160.214",
  "54.87.8.34",
  "54.156.35.251",
  "52.54.89.238",
  "18.205.178.15",
  // US-08
  "52.151.246.51",
  "52.170.163.182",
  "40.76.166.157",
  "40.76.166.170",
  "40.76.166.167",
  "40.76.166.161",
  "40.76.166.156",
  "40.76.166.166",
  "40.76.166.160",
  "40.88.51.74",
  "52.154.67.17",
  "40.76.166.80",
  "40.76.166.84",
  "40.76.166.85",
  "40.76.166.81",
  "40.76.166.71",
  "40.76.166.144",
  "40.76.166.145",
  // US-10
  "100.25.232.164",
  "35.168.86.179",
  "52.7.44.117",
  "3.92.153.18",
  "35.172.3.129",
  "50.19.162.19",
  // EU Instances
  "52.58.142.242",
  "52.29.193.121",
  "35.158.29.228",
  "18.157.135.97",
  "3.123.166.46",
  "3.64.27.36",
  "3.65.88.25",
  "3.68.144.188",
  "3.70.107.88",
  // AU-01
  "13.210.1.145",
  "13.211.70.159",
  "13.238.45.54",
  "52.65.73.167",
  "54.153.242.239",
  "54.206.45.213",
  // ID-01
  "108.136.157.246",
  "108.137.30.207",
  "16.78.128.71",
  "16.78.14.134",
  "16.78.162.208",
  "43.218.73.35",
];

function isIpAllowed(ip: string): boolean {
  return BRAZE_IP_RANGES.includes(ip);
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP address
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const requestIp = forwardedFor?.split(",")[0].trim() || realIp || "unknown";

    // Verify IP is from Braze
    if (!isIpAllowed(requestIp)) {
      console.warn(`Unauthorized request from IP: ${requestIp}`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authHeader = request.headers.get("Authorization");
    const apiKey = authHeader?.replace("Bearer ", "");

    if (!apiKey || apiKey !== env.BRAZE_CONNECTED_CONTENT_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { brazeId, email, campaignId } = body;

    if (!brazeId || !email) {
      return NextResponse.json(
        { error: "Missing required fields: brazeId and email" },
        { status: 400 }
      );
    }

    // Generate JWT token
    const token = await generateUnsubscribeToken({
      email,
      brazeId,
      campaignId: campaignId || undefined,
      sentAt: new Date().toISOString(),
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error generating unsubscribe token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
