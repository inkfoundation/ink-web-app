import { NextResponse } from "next/server";

import type { InkToken } from "@/app/[locale]/_components/HomeBoard/ink-tokens";

export const revalidate = 60;

const GECKO_TRENDING_URL =
  "https://api.geckoterminal.com/api/v2/networks/ink/trending_pools?include=base_token,quote_token";

const MAX_TOKENS = 24;
const TRENDING_PAGES = 2;

const QUOTE_ADDRESSES = new Set([
  "0x4200000000000000000000000000000000000006",
  "0x0000000000000000000000000000000000000000",
  "0x0200c29006150606b650577bbe7b6248f58470c1",
  "0xe343167631d89b6ffc58b88d6b7fb0228795491d",
  "0xf1815bd50389c46847f0bda824ec8da914045d14",
  "0x2d270e6886d130d724215a266106e6832161eaed",
]);

const PAIR_ADDRESS_RE = /^0x[a-f0-9]{40,64}$/;

const IMAGE_HOSTS = new Set([
  "coin-images.coingecko.com",
  "assets.geckoterminal.com",
]);

type GeckoTokenAttributes = {
  address?: unknown;
  name?: unknown;
  symbol?: unknown;
  image_url?: unknown;
};

type GeckoPool = {
  attributes?: {
    address?: unknown;
    base_token_price_usd?: unknown;
    quote_token_price_usd?: unknown;
    price_change_percentage?: { h24?: unknown };
    volume_usd?: { h24?: unknown };
  };
  relationships?: {
    base_token?: { data?: { id?: unknown } };
    quote_token?: { data?: { id?: unknown } };
  };
};

type GeckoIncluded = {
  id?: unknown;
  type?: unknown;
  attributes?: GeckoTokenAttributes;
};

type GeckoResponse = {
  data?: unknown;
  included?: unknown;
};

function isQuoteAddress(address: string) {
  return QUOTE_ADDRESSES.has(address);
}

function cleanText(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, max);
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function normalizeAddress(value: unknown) {
  if (typeof value !== "string") return null;
  const address = value.trim().toLowerCase();
  return PAIR_ADDRESS_RE.test(address) ? address : null;
}

function geckoTerminalHref(pairAddress: string) {
  return `https://www.geckoterminal.com/ink/pools/${pairAddress}`;
}

function sanitizeImageUrl(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    const host = url.hostname.toLowerCase();
    if (
      IMAGE_HOSTS.has(host) ||
      host.endsWith(".geckoterminal.com") ||
      host.endsWith(".coingecko.com")
    ) {
      return url.href;
    }
  } catch {
    return null;
  }
  return null;
}

function tokenFromIncluded(
  included: Map<string, GeckoTokenAttributes>,
  id: unknown
) {
  if (typeof id !== "string") return null;
  const attributes = included.get(id);
  if (!attributes) return null;
  const address = normalizeAddress(attributes.address);
  const symbol = cleanText(attributes.symbol, 24);
  const name = cleanText(attributes.name, 64);
  if (!address || !symbol) return null;
  return {
    address,
    symbol,
    name: name || symbol,
    imageUrl: sanitizeImageUrl(attributes.image_url),
  };
}

function collectIncluded(
  payload: GeckoResponse,
  included: Map<string, GeckoTokenAttributes>
) {
  if (!Array.isArray(payload.included)) return;
  for (const item of payload.included as GeckoIncluded[]) {
    if (
      item.type === "token" &&
      typeof item.id === "string" &&
      item.attributes
    ) {
      included.set(item.id, item.attributes);
    }
  }
}

function appendPools(
  payload: GeckoResponse,
  tokens: InkToken[],
  seen: Set<string>
) {
  const included = new Map<string, GeckoTokenAttributes>();
  collectIncluded(payload, included);

  const pools = Array.isArray(payload.data)
    ? (payload.data as GeckoPool[])
    : [];

  for (const pool of pools) {
    if (tokens.length >= MAX_TOKENS) break;

    const pairAddress = normalizeAddress(pool.attributes?.address);
    if (!pairAddress) continue;

    const base = tokenFromIncluded(
      included,
      pool.relationships?.base_token?.data?.id
    );
    const quote = tokenFromIncluded(
      included,
      pool.relationships?.quote_token?.data?.id
    );
    if (!base || !quote) continue;

    const flip = isQuoteAddress(base.address) && !isQuoteAddress(quote.address);
    const displayed = flip ? quote : base;
    if (seen.has(displayed.address)) continue;

    const priceUsd = toNumber(
      flip
        ? pool.attributes?.quote_token_price_usd
        : pool.attributes?.base_token_price_usd
    );
    if (priceUsd === null) continue;

    const rawChange =
      toNumber(pool.attributes?.price_change_percentage?.h24) ?? 0;
    const change24h = flip ? -rawChange : rawChange;
    const volume24h = toNumber(pool.attributes?.volume_usd?.h24) ?? 0;

    seen.add(displayed.address);
    tokens.push({
      symbol: displayed.symbol,
      name: displayed.name,
      imageUrl: displayed.imageUrl,
      priceUsd,
      change24h,
      volume24h,
      pairAddress,
      href: geckoTerminalHref(pairAddress),
    });
  }
}

async function fetchTrendingPage(page: number) {
  const response = await fetch(`${GECKO_TRENDING_URL}&page=${page}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Ink-WebApp/1.0",
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(
      `GeckoTerminal trending page ${page} failed: ${response.status}`
    );
  }

  return (await response.json()) as GeckoResponse;
}

export async function GET() {
  try {
    const pages = await Promise.all(
      Array.from({ length: TRENDING_PAGES }, (_, index) =>
        fetchTrendingPage(index + 1)
      )
    );

    const tokens: InkToken[] = [];
    const seen = new Set<string>();
    for (const page of pages) {
      appendPools(page, tokens, seen);
      if (tokens.length >= MAX_TOKENS) break;
    }

    return NextResponse.json(
      { tokens },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("Ink tokens route failed", error);
    return NextResponse.json(
      { tokens: [] },
      {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
