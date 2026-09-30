export type InkNft = {
  name: string;
  slug: string;
  imageUrl: string | null;
  floorUsd: number | null;
  change24h: number;
  href: string;
};

export type InkNftsResponse = {
  nfts: InkNft[];
};

export async function fetchInkNfts(): Promise<InkNft[]> {
  const response = await fetch("/api/ink-nfts");
  const payload = (await response.json()) as InkNftsResponse;
  if (!response.ok) {
    throw new Error("Failed to load NFTs");
  }
  return Array.isArray(payload.nfts) ? payload.nfts : [];
}
