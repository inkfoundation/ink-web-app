import { NextResponse } from "next/server";

import type { InkNft } from "@/app/[locale]/_components/HomeBoard/ink-nfts";

export const revalidate = 60;

const OPENSEA_GRAPHQL = "https://gql.opensea.io/graphql";
const MAX_NFTS = 24;
const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;
const IMAGE_HOSTS = new Set(["i2c.seadn.io", "i.seadn.io", "opensea.io"]);

const TOP_COLLECTIONS_QUERY = `
  query InkTopCollections($limit: Int!) {
    topCollections(
      sort: { by: ONE_DAY_VOLUME, direction: DESC }
      limit: $limit
      filter: { chains: ["ink"] }
    ) {
      items {
        name
        slug
        imageUrl
        floorPrice {
          pricePerItem {
            usd
          }
        }
        stats {
          oneDay {
            floorPriceChange
          }
        }
      }
    }
  }
`;

type OpenSeaCollection = {
  name?: unknown;
  slug?: unknown;
  imageUrl?: unknown;
  floorPrice?: { pricePerItem?: { usd?: unknown } };
  stats?: { oneDay?: { floorPriceChange?: unknown } };
};

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

function sanitizeSlug(value: unknown) {
  const slug = cleanText(value, 80).toLowerCase();
  return SLUG_RE.test(slug) ? slug : null;
}

function openseaHref(slug: string) {
  return `https://opensea.io/collection/${slug}`;
}

function sanitizeImageUrl(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    const host = url.hostname.toLowerCase();
    if (IMAGE_HOSTS.has(host) || host.endsWith(".seadn.io")) {
      return url.href;
    }
  } catch {
    return null;
  }
  return null;
}

function mapCollections(items: unknown): InkNft[] {
  if (!Array.isArray(items)) return [];
  const nfts: InkNft[] = [];
  const seen = new Set<string>();

  for (const item of items as OpenSeaCollection[]) {
    const slug = sanitizeSlug(item.slug);
    const name = cleanText(item.name, 64);
    if (!slug || !name || seen.has(slug)) continue;

    seen.add(slug);
    nfts.push({
      name,
      slug,
      imageUrl: sanitizeImageUrl(item.imageUrl),
      floorUsd: toNumber(item.floorPrice?.pricePerItem?.usd),
      change24h: (toNumber(item.stats?.oneDay?.floorPriceChange) ?? 0) * 100,
      href: openseaHref(slug),
    });

    if (nfts.length >= MAX_NFTS) break;
  }

  return nfts;
}

export async function GET() {
  try {
    const response = await fetch(OPENSEA_GRAPHQL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "Ink-WebApp/1.0",
      },
      body: JSON.stringify({
        query: TOP_COLLECTIONS_QUERY,
        variables: { limit: MAX_NFTS },
      }),
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.error("OpenSea NFT request failed", response.status);
      return NextResponse.json(
        { nfts: [] },
        {
          status: 502,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    const payload = (await response.json()) as {
      data?: { topCollections?: { items?: unknown } };
    };
    const nfts = mapCollections(payload.data?.topCollections?.items);

    return NextResponse.json(
      { nfts },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("Ink NFTs route failed", error);
    return NextResponse.json(
      { nfts: [] },
      {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
