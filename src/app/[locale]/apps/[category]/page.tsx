import { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/JsonLd";
import { PageView } from "@/components/PageView";

import { isAppCategory } from "../_components/filter-apps";

type AppsCategoryParams = Promise<{ category: string }>;

/**
 * `[category]` matches any segment, so without this guard `/apps/<anything>`
 * rendered a 200 with a self-referencing canonical, which Search Console
 * reports as a soft 404. Only the slugs in `appCategories` are real pages;
 * everything else gets a true 404 (with `noindex`) from `not-found.tsx`.
 */
async function resolveCategory(params: AppsCategoryParams) {
  const { category } = await params;
  if (!isAppCategory(category)) {
    notFound();
  }
  return category;
}

export async function generateMetadata({
  params,
}: {
  params: AppsCategoryParams;
}): Promise<Metadata> {
  const category = await resolveCategory(params);
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
  params: AppsCategoryParams;
}) {
  const category = await resolveCategory(params);
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
