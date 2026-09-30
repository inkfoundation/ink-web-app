export type InkToken = {
  symbol: string;
  name: string;
  imageUrl: string | null;
  priceUsd: number;
  change24h: number;
  volume24h: number;
  pairAddress: string;
  href: string;
};

export type InkTokensResponse = {
  tokens: InkToken[];
};

export const tokenSorts = ["trending", "volume", "txns"] as const;
export type TokenSort = (typeof tokenSorts)[number];

export async function fetchInkTokens(
  sort: TokenSort = "trending"
): Promise<InkToken[]> {
  const response = await fetch(
    sort === "trending" ? "/api/ink-tokens" : `/api/ink-tokens?sort=${sort}`
  );
  const payload = (await response.json()) as InkTokensResponse;
  if (!response.ok) {
    throw new Error("Failed to load tokens");
  }
  return Array.isArray(payload.tokens) ? payload.tokens : [];
}
