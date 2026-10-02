import { NextResponse } from "next/server";

import type { InkToken } from "@/app/[locale]/_components/HomeBoard/ink-tokens";

export const revalidate = 60;

const GECKO_TRENDING_URL =
  "https://api.geckoterminal.com/api/v2/networks/ink/trending_pools?include=base_token,quote_token";
const GECKO_POOLS_URL =
  "https://api.geckoterminal.com/api/v2/networks/ink/pools?include=base_token,quote_token";

const TOKEN_SORTS = ["trending", "volume", "txns"] as const;
type TokenSort = (typeof TOKEN_SORTS)[number];

function parseTokenSort(value: string | null): TokenSort {
  return TOKEN_SORTS.find((sort) => sort === value) ?? "trending";
}

function poolsPageUrl(sort: TokenSort, page: number) {
  if (sort === "trending") return `${GECKO_TRENDING_URL}&page=${page}`;
  const geckoSort =
    sort === "volume" ? "h24_volume_usd_desc" : "h24_tx_count_desc";
  return `${GECKO_POOLS_URL}&sort=${geckoSort}&page=${page}`;
}

const MAX_TOKENS = 24;
const TRENDING_PAGES = 2;
const UPSTREAM_TIMEOUT_MS = 8_000;

// Stablecoins on Ink. A pool quoted in one of these gives a 24hr change that is
// effectively in USD, so it is the preferred source for a token's change.
const STABLE_ADDRESSES = new Set([
  "0x0200c29006150606b650577bbe7b6248f58470c1", // USD₮0
  "0xe343167631d89b6ffc58b88d6b7fb0228795491d", // USDG
  "0xf1815bd50389c46847f0bda824ec8da914045d14", // USDC.e
  "0x2d270e6886d130d724215a266106e6832161eaed", // USDC
  "0x1217bfe6c773eec6cc4a38b5dc45b92292b6e189", // oUSDT
  "0xfc421ad3c883bf9e7c4f42de845c4e4405799e73", // GHO
]);

// Quote assets: the stablecoins plus ETH. These sit on the quote side of almost
// every pool, so their "volume" is really everyone else's trading. They are
// never listed as tokens, and pools where both sides are quote assets
// (USDG/USDC.e, USD₮0/WETH, ...) are skipped rather than surfacing a
// stablecoin at $1.00 as the top token on Ink.
const QUOTE_ADDRESSES = new Set([
  "0x4200000000000000000000000000000000000006", // WETH
  "0x0000000000000000000000000000000000000000", // native ETH
  ...STABLE_ADDRESSES,
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
    reserve_in_usd?: unknown;
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

type TokenInfo = NonNullable<ReturnType<typeof tokenFromIncluded>>;

type Candidate = {
  pairAddress: string;
  priceUsd: number;
  change24h: number;
  volume24h: number;
  reserveUsd: number;
  // 2: token is the pool's base and the quote is a stablecoin.
  // 1: token is the base, quoted in something else (ETH).
  // 0: token is the quote side; the change is only an estimate.
  quality: 0 | 1 | 2;
};

type TokenPools = { token: TokenInfo; candidates: Candidate[] };

function collectPools(
  payload: GeckoResponse,
  byToken: Map<string, TokenPools>,
  order: string[]
) {
  const included = new Map<string, GeckoTokenAttributes>();
  collectIncluded(payload, included);

  const pools = Array.isArray(payload.data)
    ? (payload.data as GeckoPool[])
    : [];

  for (const pool of pools) {
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

    const baseIsQuoteAsset = isQuoteAddress(base.address);
    const quoteIsQuoteAsset = isQuoteAddress(quote.address);
    // Stable/stable and stable/ETH pools: nothing here to list as a token.
    if (baseIsQuoteAsset && quoteIsQuoteAsset) continue;

    const flip = baseIsQuoteAsset;
    const token = flip ? quote : base;
    const priceUsd = toNumber(
      flip
        ? pool.attributes?.quote_token_price_usd
        : pool.attributes?.base_token_price_usd
    );
    if (priceUsd === null) continue;

    // GeckoTerminal's h24 figure is the *base* token's change. When the listed
    // token is the quote side, invert the base's move as an estimate; the
    // picker only uses it if the token has no pool where it is the base.
    const rawChange =
      toNumber(pool.attributes?.price_change_percentage?.h24) ?? 0;
    const change24h = flip
      ? rawChange <= -100
        ? 0
        : (1 / (1 + rawChange / 100) - 1) * 100
      : rawChange;

    const quality: Candidate["quality"] = flip
      ? 0
      : STABLE_ADDRESSES.has(quote.address)
        ? 2
        : 1;

    const entry = byToken.get(token.address);
    const candidate: Candidate = {
      pairAddress,
      priceUsd,
      change24h,
      volume24h: toNumber(pool.attributes?.volume_usd?.h24) ?? 0,
      reserveUsd: toNumber(pool.attributes?.reserve_in_usd) ?? 0,
      quality,
    };
    if (entry) {
      entry.candidates.push(candidate);
    } else {
      byToken.set(token.address, { token, candidates: [candidate] });
      order.push(token.address);
    }
  }
}

// Ranking position comes from the first pool a token appears in (so the sort
// still means what it says); price, 24hr change and link come from the
// token's best pool: stablecoin-quoted beats ETH-quoted beats quote-side, and
// within a tier the deepest pool wins. This keeps the change consistent across
// sorts instead of depending on whichever pool happened to come first.
function pickTokens(byToken: Map<string, TokenPools>, order: string[]) {
  const tokens: InkToken[] = [];
  for (const address of order) {
    if (tokens.length >= MAX_TOKENS) break;
    const entry = byToken.get(address);
    if (!entry) continue;

    const best = entry.candidates.reduce((current, candidate) =>
      candidate.quality > current.quality ||
      (candidate.quality === current.quality &&
        candidate.reserveUsd > current.reserveUsd)
        ? candidate
        : current
    );
    const volume24h = entry.candidates.reduce(
      (sum, candidate) => sum + candidate.volume24h,
      0
    );

    tokens.push({
      symbol: entry.token.symbol,
      name: entry.token.name,
      imageUrl: entry.token.imageUrl,
      priceUsd: best.priceUsd,
      change24h: best.change24h,
      volume24h,
      pairAddress: best.pairAddress,
      href: geckoTerminalHref(best.pairAddress),
    });
  }
  return tokens;
}

async function fetchPoolsPage(sort: TokenSort, page: number) {
  const response = await fetch(poolsPageUrl(sort, page), {
    headers: {
      Accept: "application/json",
      "User-Agent": "Ink-WebApp/1.0",
    },
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(
      `GeckoTerminal ${sort} page ${page} failed: ${response.status}`
    );
  }

  return (await response.json()) as GeckoResponse;
}

export async function GET(request: Request) {
  const sort = parseTokenSort(new URL(request.url).searchParams.get("sort"));

  try {
    const pages = await Promise.all(
      Array.from({ length: TRENDING_PAGES }, (_, index) =>
        fetchPoolsPage(sort, index + 1)
      )
    );

    const byToken = new Map<string, TokenPools>();
    const order: string[] = [];
    for (const page of pages) {
      collectPools(page, byToken, order);
    }
    const tokens = pickTokens(byToken, order);

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
