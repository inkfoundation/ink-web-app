import { Metadata } from "next";

import { JsonLd } from "@/components/JsonLd";
import { PageView } from "@/components/PageView";

export const metadata: Metadata = {
  title: "Ink Apps - Discover DeFi Applications on the Superchain",
  description:
    "Explore a curated collection of DeFi applications built on Ink, Kraken's Layer 2 blockchain. Find innovative financial tools, protocols, and services powered by the Superchain.",
};

export default function AppsPage() {
  return (
    <>
      <JsonLd
        schema={{
          "@type": "CollectionPage",
          name: "Ink Apps Directory",
          description: "Directory of DeFi applications built on Ink",
          url: "https://inkonchain.com/apps",
        }}
      />
      <PageView />
    </>
  );
}
