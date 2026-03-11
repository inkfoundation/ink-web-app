import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export const locales = ["en-US"] as const;
export const defaultLocale = "en-US" as const;

/**
 * Somehow, the trick to use a static name in `pathnames` doesn't work with the new `createNavigation` (as opposed to `createLocalizedPathnamesNavigation`)
 * So the trick here is to include all the *expanded* links in `pathnames`,
 *  then we can use `EXTERNAL_LINKS` to retrieve the name and we _almost_ get the same behavior as before.
 * The main drawback is that we need all links to be static, so we can't use functions (like `encodeURI`)
 */
export const EXTERNAL_LINKS = {
  documentation: "https://docs.inkonchain.com/",
  brandKit: "https://docs.inkonchain.com/work-with-ink/brand-kit",
  inkubator: "https://inkubator.inkonchain.com/",
  status: "https://status.inkonchain.com/",
  inkJobs: "https://jobs.inkonchain.com/",
  intopia: "https://lu.ma/h8rbfyse",
  inkdenver: "https://lu.ma/kvj8l82q",
  twitter: "https://x.com/inkonchain",
  github: "https://github.com/inkonchain",
  telegram: "https://t.me/inkonchain",
  farcaster: "https://warpcast.com/inkonchain",
  superchain: "https://www.superchain.eco/",
  ethereum: "https://ethereum.org/",
  twitterShareLink:
    "https://x.com/intent/tweet?text=I'm%20getting%20the%20latest%20updates%20on%20Ink%20-%20a%20new%20Ethereum%20L2%20launching%20soon.%20You%20can%20too%20at%20&url=https://inkonchain.com/%60",
  kraken: "https://www.kraken.com/",
  krakenPrivacyNotice: "https://www.kraken.com/legal/privacy",
  contact: "https://docs.inkonchain.com/",
  discoverInk: "https://docs.inkonchain.com/",
  testnetExplorerBlockscout: "https://explorer-sepolia.inkonchain.com/",
  mainnetExplorerBlockscout: "https://explorer.inkonchain.com/",
  testnetExplorerRoutescan: "https://sepolia.inkonscan.xyz/", // TODO: replace with actual URL when I get it
  mainnetExplorerRoutescan: "https://explorer.inkonchain.com/", // TODO: replace with actual URL when I get it
  testnetExplorerOkx: "https://explorer-sepolia.inkonchain.com/", // TODO: replace with actual URL when I get it
  mainnetExplorerOkx: "https://www.okx.com/en-au/web3/explorer/inkchain",
  inkKit: "https://github.com/inkonchain/ink-kit",
  guild: "https://guild.xyz/",
  legal: "mailto:legal@inkonchain.com",
  gm: "https://gm.inkonchain.com",
  // TODO: update this.
  inkVerify: "https://verify.inkonchain.com/",
  relayTxHistory: "https://relay.link/transactions?address=[address]",
  l1Explorer: "https://sepolia.etherscan.io/tx/[hash]",
  optimism: "https://www.optimism.io/",
  // TODO: update this.
  grant: "https://docs.inkonchain.com/ink-grants",
  // TODO: update this.
  retroGrant: "https://docs.inkonchain.com/ink-grants/retro-grants",
  eas: "https://docs.attest.org/docs/welcome",
  verifySupport: "https://support.kraken.com/hc/en-us/articles/kraken-verify",
  verifyDocs: "https://docs.inkonchain.com/build/verify",
  tydro: "https://app.tydro.com/",
  nado: "https://app.nado.xyz/",
} as const;

type ExternalLinkValues = (typeof EXTERNAL_LINKS)[keyof typeof EXTERNAL_LINKS];
const externalLinksMap = (
  Object.values(EXTERNAL_LINKS) as Array<ExternalLinkValues>
).reduce(
  (all, current: ExternalLinkValues) => {
    all[current] = current;
    return all;
  },
  {} as Record<ExternalLinkValues, ExternalLinkValues>
);

// Define routing configuration
export const routing = defineRouting({
  localePrefix: "as-needed",
  locales,
  defaultLocale,
  pathnames: {
    "#": "/#",
    "#contact": "#contact",
    "/": "/",
    "/dashboard": "/",
    "/testnet-bridge": "/testnet-bridge",
    "/apps": "/apps",
    "/apps/[category]": "/apps/[category]",
    "/bridge": "/bridge",
    "/verify": "/verify",
    "/verify/faq": "/verify/faq",
    "/community": "/community",
    "/about": "/about",
    "/builders": "/builders",
    "/terms": "/terms",
    "/timeline": "/timeline",
    "/apply": "/apply",
    "/leaderboard": "/leaderboard",
    "/faucet": "/faucet",
    "/inkubator": "/inkubator",
    "/status": "/status",
    "/cookie": "/cookie",
    "/newsletter/resubscribe": "/newsletter/resubscribe",
    "/newsletter/unsubscribe": "/newsletter/unsubscribe",
    "/faq": "/faq",
    ...externalLinksMap,
  },
});

// Create and export the navigation utilities
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

const pathnames = routing.pathnames;

// Type definitions
export type Pathnames = keyof typeof pathnames;
export type PathnamesWithoutParameterizedPaths = {
  [K in Pathnames]: K extends `${string}[${string}]` ? never : K;
}[Pathnames];
export type Locale = (typeof routing.locales)[number];
export type Anchors =
  | {
      [K in Pathnames]: K extends `/#${string}` ? K : never;
    }[Pathnames]
  | "#";
export type HrefProp = React.ComponentProps<typeof Link>["href"];

// Utility functions
export function compactLanguage(lang: string) {
  return lang.split("-").join("");
}

export function pathFromHrefProp(href: HrefProp) {
  return typeof href === "object" && "pathname" in href ? href.pathname : href;
}

export function hrefObjectFromHrefPropWithQuery(
  href: HrefProp,
  query: string
): HrefProp {
  return typeof href === "object" && "pathname" in href
    ? { ...href, query }
    : ({ pathname: href, query } as HrefProp);
}

export function isExternalPath(href: Pathnames) {
  const url =
    typeof pathnames[href] === "object"
      ? pathnames[href]["en-US"]
      : pathnames[href];
  return !url.startsWith("/") && !url.startsWith("#");
}

export function parseHrefProp(href: HrefProp) {
  return typeof href === "object" && "pathname" in href
    ? `${href.pathname}?${href.query}`
    : href;
}
