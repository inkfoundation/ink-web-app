import { Metadata } from "next";

import { JsonLd } from "@/components/JsonLd";
import { PageView } from "@/components/PageView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  return {
    title: "Ink Apps - Discover DeFi Applications on the Superchain",
    description:
      "Explore a curated collection of DeFi applications built on Ink, Kraken's Layer 2 blockchain. Find innovative financial tools, protocols, and services powered by the Superchain.",
    alternates: {
      canonical: `https://inkonchain.com/apps/${encodeURIComponent(category)}`,
    },
  };
}

export default async function AppsPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  return (
    <>
      <JsonLd
        schema={{
          "@type": "CollectionPage",
          name: "Ink Apps Directory",
          description: "Directory of DeFi applications built on Ink",
          url: `https://inkonchain.com/apps/${encodeURIComponent(category)}`,
        }}
      />
      <PageView />
    </>
  );
}
