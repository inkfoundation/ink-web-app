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

export async function fetchInkTokens(): Promise<InkToken[]> {
  const response = await fetch("/api/ink-tokens");
  const payload = (await response.json()) as InkTokensResponse;
  if (!response.ok) {
    throw new Error("Failed to load tokens");
  }
  return Array.isArray(payload.tokens) ? payload.tokens : [];
}
