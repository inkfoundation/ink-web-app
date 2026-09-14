import { Metadata } from "next";

import { PageView } from "@/components/PageView";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://inkonchain.com/bridge",
  },
  title: "Bridge to Ink",
  description:
    "Transfer assets to Ink, Kraken's Ethereum Layer 2. Bridge from Ethereum with Relay or choose another Superchain bridge.",
};

export default function BridgePage() {
  return <PageView />;
}
