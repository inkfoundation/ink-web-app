import fs from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), "cache", "eth-price.json");
const CACHE_DURATION = 30 * 1000; // 30 seconds

interface CacheData {
  price: string;
  timestamp: number;
}

async function ensureCacheDirectory() {
  const cacheDir = path.join(process.cwd(), "cache");
  try {
    await fs.access(cacheDir);
  } catch {
    await fs.mkdir(cacheDir, { recursive: true });
  }
}

async function getCachedPrice(): Promise<CacheData | null> {
  try {
    const data = await fs.readFile(CACHE_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Cache read error:", error);
    return null;
  }
}

async function setCachedPrice(price: string) {
  const data: CacheData = {
    price,
    timestamp: Date.now(),
  };
  await ensureCacheDirectory();
  await fs.writeFile(CACHE_FILE, JSON.stringify(data), { mode: 0o644 });
}

async function fetchKrakenPrice(): Promise<string> {
  const response = await fetch(
    "https://api.kraken.com/0/public/Trades?pair=ETHUSD&count=1",
    { cache: "no-store" } // Ensure we don't get cached responses from fetch
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (data.error && data.error.length > 0) {
    throw new Error(`Kraken API error: ${data.error.join(", ")}`);
  }

  if (!data.result?.XETHZUSD?.[0]?.[0]) {
    throw new Error("Unexpected API response format");
  }

  return data.result.XETHZUSD[0][0];
}

export async function GET() {
  try {
    const cached = await getCachedPrice();

    const now = Date.now();
    const isCacheValid = cached && now - cached.timestamp < CACHE_DURATION;

    if (isCacheValid) {
      return NextResponse.json({ price: cached.price });
    }

    const price = await fetchKrakenPrice();

    await setCachedPrice(price);

    return NextResponse.json({ price });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ETH price" },
      { status: 500 }
    );
  }
}
