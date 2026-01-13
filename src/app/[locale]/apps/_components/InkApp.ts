import DOMPurify from "isomorphic-dompurify";

import appsData from "./apps-data.json";

export interface InkApp {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string[];
  network: InkAppNetwork;
  tags: string[];
  links: {
    mainnetWebsite: string;
    testnetWebsite: string;
    x: string;
    discord: string;
    telegram: string;
    github: string;
    farcaster: string;
    smartContractUrl?: string;
  };
  order?: number;
  pills?: string[];
}

export type InkAppNetwork = "Mainnet" | "Testnet" | "Both";

const apps = appsData.apps
  .map((app) => {
    return {
      id: DOMPurify.sanitize(app.id),
      name: DOMPurify.sanitize(app.name),
      description: DOMPurify.sanitize(app.description),
      imageUrl: DOMPurify.sanitize(app.imageUrl),
      category: app.category.map((c) => DOMPurify.sanitize(c)),
      tags: app.tags.map((t) => DOMPurify.sanitize(t)),
      network: DOMPurify.sanitize(app.network) as InkAppNetwork,
      links: {
        mainnetWebsite: DOMPurify.sanitize(app.links.mainnetWebsite),
        testnetWebsite: DOMPurify.sanitize(app.links.testnetWebsite),
        x: DOMPurify.sanitize(app.links.x),
        discord: DOMPurify.sanitize(app.links.discord),
        telegram: DOMPurify.sanitize(app.links.telegram),
        github: DOMPurify.sanitize(app.links.github),
        farcaster: DOMPurify.sanitize(app.links.farcaster),
        smartContractUrl: app.links.smartContractUrl
          ? DOMPurify.sanitize(app.links.smartContractUrl)
          : undefined,
      },
      order: app.order,
      pills: app.pills?.map((p) => DOMPurify.sanitize(p)),
    } satisfies InkApp;
  })
  .sort((a, b) => a.name.localeCompare(b.name));

export const inkApps: InkApp[] = apps;
export const inkFeaturedApps = inkApps
  .filter((a) =>
    [
      "nado",
      "tydro",
      "kraken-wallet",
      "reservoir:-relay",
      "velodrome",
    ].includes(a.id)
  )
  .sort((a, b) => {
    // For featured apps, sort by order if both have it
    if (a.order !== undefined && b.order !== undefined) {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a.name.localeCompare(b.name);
    }
    // If only one has order, prioritize it
    if (a.order !== undefined) {
      return -1;
    }
    if (b.order !== undefined) {
      return 1;
    }
    // Neither has order, sort alphabetically
    return a.name.localeCompare(b.name);
  });
export const inkHomeApps = inkApps
  .filter((a) =>
    [
      "nado",
      "tydro",
      "kraken-wallet",
      "deep-on-ink",
      "velodrome",
      "gm",
      "inkypump",
    ].includes(a.id)
  )
  .sort((a, b) => {
    // For featured home apps, sort by order if both have it
    if (a.order !== undefined && b.order !== undefined) {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a.name.localeCompare(b.name);
    }
    // If only one has order, prioritize it
    if (a.order !== undefined) {
      return -1;
    }
    if (b.order !== undefined) {
      return 1;
    }
    // Neither has order, sort alphabetically
    return a.name.localeCompare(b.name);
  });
export const inkTransparentIcons: string[] = [];
export const inkTags: string[] = apps.reduce((acc, app) => {
  app.tags.forEach((tag) => {
    if (!acc.includes(tag)) {
      acc.push(tag);
    }
  });
  return acc;
}, [] as string[]);

export interface InkAppFilters {
  search: string;
  categories: string[];
  tags: string[];
  network?: InkAppNetwork;
}

export function mainUrl(app: InkApp, network: InkAppNetwork) {
  const websiteUrl =
    network === "Testnet" ? app.links.testnetWebsite : app.links.mainnetWebsite;

  return (
    websiteUrl ||
    app.links.x ||
    app.links.discord ||
    app.links.telegram ||
    app.links.github ||
    app.links.farcaster
  );
}
