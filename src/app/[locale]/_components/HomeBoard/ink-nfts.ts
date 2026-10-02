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

export const nftSorts = ["volume", "hour", "floor", "sales"] as const;
export type NftSort = (typeof nftSorts)[number];

export async function fetchInkNfts(
  sort: NftSort = "volume"
): Promise<InkNft[]> {
  const response = await fetch(
    sort === "volume" ? "/api/ink-nfts" : `/api/ink-nfts?sort=${sort}`
  );
  const payload = (await response.json()) as InkNftsResponse;
  if (!response.ok) {
    throw new Error("Failed to load NFTs");
  }
  return Array.isArray(payload.nfts) ? payload.nfts : [];
}
