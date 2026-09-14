import { EXTERNAL_LINKS } from "@/routing";

export type BuilderResource =
  | {
      name: string;
      href: string;
      external: true;
    }
  | {
      name: string;
      href: "/faucet" | "/testnet-bridge";
      external?: false;
    };

export type BuilderHeroCta =
  | {
      key: "docs";
      href: typeof EXTERNAL_LINKS.documentation;
      external: true;
      tone: "purple";
    }
  | {
      key: "testnet";
      href: "/faucet";
      external?: false;
      tone: "gray";
    }
  | {
      key: "explorer";
      href:
        | typeof EXTERNAL_LINKS.mainnetExplorerBlockscout
        | typeof EXTERNAL_LINKS.testnetExplorerBlockscout;
      external: true;
      tone: "gray";
    }
  | {
      key: "github";
      href: typeof EXTERNAL_LINKS.github;
      external: true;
      tone: "gray";
    };

export function builderHeroCtas(isMainnet: boolean): BuilderHeroCta[] {
  return [
    {
      key: "docs",
      href: EXTERNAL_LINKS.documentation,
      external: true,
      tone: "purple",
    },
    { key: "testnet", href: "/faucet", tone: "gray" },
    {
      key: "explorer",
      href: isMainnet
        ? EXTERNAL_LINKS.mainnetExplorerBlockscout
        : EXTERNAL_LINKS.testnetExplorerBlockscout,
      external: true,
      tone: "gray",
    },
    {
      key: "github",
      href: EXTERNAL_LINKS.github,
      external: true,
      tone: "gray",
    },
  ];
}

export const builderStartSteps = [
  {
    key: "faucet",
    href: "/faucet",
    external: false,
  },
  {
    key: "docs",
    href: EXTERNAL_LINKS.documentation,
    external: true,
  },
  {
    key: "deploy",
    href: EXTERNAL_LINKS.documentationDeployContract,
    external: true,
  },
] as const;

export type BuilderStartStepKey = (typeof builderStartSteps)[number]["key"];

export function builderResources(isMainnet: boolean): BuilderResource[] {
  const links: BuilderResource[] = [
    { name: "Ink Kit", href: EXTERNAL_LINKS.inkKit, external: true },
    { name: "Docs", href: EXTERNAL_LINKS.documentation, external: true },
    { name: "Status", href: EXTERNAL_LINKS.status, external: true },
    {
      name: "Explorer",
      href: isMainnet
        ? EXTERNAL_LINKS.mainnetExplorerBlockscout
        : EXTERNAL_LINKS.testnetExplorerBlockscout,
      external: true,
    },
    { name: "Testnet Faucet", href: "/faucet" },
    { name: "Github", href: EXTERNAL_LINKS.github, external: true },
  ];

  if (!isMainnet) {
    links.push({ name: "Bridge", href: "/testnet-bridge" });
  }

  return links;
}

export const builderStats = [
  {
    key: "tvl",
    value: "$150M+",
    href: EXTERNAL_LINKS.defillamaInk,
  },
  {
    key: "secured",
    value: "$300M+",
    href: EXTERNAL_LINKS.l2beatInk,
  },
  {
    key: "transactions",
    value: "1M+",
    href: EXTERNAL_LINKS.growthepieInk,
  },
  {
    key: "blocks",
    value: "1s",
  },
] as const;

export type BuilderStatKey = (typeof builderStats)[number]["key"];

export const builderExpectations = [
  {
    title: "Sub-second block times",
    description: "1s block times Day 1, sub-second blocks coming soon.",
    icon: "/icons/1s-block-times.svg",
  },
  {
    title: "Smol Gas",
    description: "Ape more, pay less.",
    icon: "/icons/Smol-Gas.svg",
  },
  {
    title: "Security",
    description:
      "Sequencer-level security to protect users from malicious intents and exploits.",
    icon: "/icons/Security.svg",
  },
  {
    title: "Interoperability",
    description:
      "A commitment to the seamless flow of capital across the Superchain and beyond.",
    icon: "/icons/Interoperability.svg",
  },
  {
    title: "Unleashed by Kraken",
    description:
      "Ink will leverage Kraken's security and crypto expertise to support builders and users alike as they move towards independent financial sovereignty.",
    icon: "/icons/Unleashed-by-Kraken.svg",
  },
  {
    title: "Scaling Ethereum",
    description:
      "Ink is dedicated to scaling Ethereum with a powerful L2 that enhances performance and accessibility.",
    icon: "/icons/ethereum-eth-logo.svg",
  },
] as const;
