import { Metadata } from "next";

import { JsonLd } from "@/components/JsonLd";
import { PageView } from "@/components/PageView";
import { newLayoutContainerClasses } from "@/components/styles/container";

import { HomeApps } from "./_components/Home/HomeApps";
import { HomeSmallTag } from "./_components/Home/HomeSmallTag";
import { HomeTagLine } from "./_components/Home/HomeTagLine";
import { HomeTitle } from "./_components/Home/HomeTitle";
import { HomeTydro } from "./_components/Home/HomeTydro";

export const metadata: Metadata = {
  metadataBase: new URL("https://inkonchain.com"),
  title: "Ink - DeFi unleashed by Kraken, built on the Superchain",
  description:
    "Ink is a cutting-edge Layer 2 (L2) blockchain built on Optimism's Superchain and released by Kraken. As a natural evolution of our mission, Ink will serve as a seamless bridge to DeFi, empowering users to move onchain with confidence and ease. Join the community today.",
  openGraph: {
    url: "/",
    images: [
      {
        url: "/goodbye-chaos-hello-ink.png",
        width: 1200,
        height: 630,
        alt: "Ink Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/goodbye-chaos-hello-ink.png"],
  },
};

export default async function HomePage() {
  return (
    <>
      <JsonLd
        schema={{
          "@type": "Organization",
          name: "Ink",
          alternateName: "Kraken Ink",
          url: "https://inkonchain.com/",
          logo: "https://inkonchain.com/icon.svg?163528741f97f677",
          sameAs: [
            "https://x.com/inkonchain",
            "https://github.com/inkonchain",
            "https://discord.com/invite/inkonchain",
            "https://t.me/inkonchain",
          ],
        }}
      />
      <PageView />
      <div className={newLayoutContainerClasses()}>
        <HomeSmallTag />
        <HomeTitle />
        <HomeTydro />
        <HomeApps />
        <HomeTagLine />
      </div>
    </>
  );
}
