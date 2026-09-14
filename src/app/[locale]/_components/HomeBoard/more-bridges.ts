export type MoreBridge = {
  name: string;
  url: string;
  icon: string;
  description: string;
  assetIcons: string[];
};

export const moreBridges: MoreBridge[] = [
  {
    name: "Kraken",
    url: "https://www.kraken.com/",
    icon: "/icons/kraken-app.svg",
    description: "Buy crypto and move it onto Ink from Kraken.",
    assetIcons: ["kbtc", "usdg"],
  },
  {
    name: "Bungee",
    url: "https://www.bungee.exchange/?intro=true&toChainId=57073&toTokenAddress=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee&fromChainId=1&fromTokenAddress=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    icon: "/featured-apps/icons/bungee.webp",
    description: "Best-route swaps onto Ink from any chain.",
    assetIcons: ["eth", "usdt0", "usdc"],
  },
  {
    name: "Super Bridge",
    url: "https://superbridge.app/?fromChainId=1&toChainId=57073",
    icon: "/featured-apps/icons/superbridge.webp",
    description: "Native Superchain bridge for ETH and stables.",
    assetIcons: ["eth", "usdc"],
  },
  {
    name: "USDT0 Native Bridge",
    url: "https://usdt0.to/transfer?source=ethereum&destination=ink",
    icon: "/icons/USDT0.svg",
    description: "Move USDT0 natively onto Ink.",
    assetIcons: ["usdt0"],
  },
  {
    name: "Stargate",
    url: "https://stargate.finance/?srcChain=ethereum&srcToken=0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7&dstChain=ink&dstToken=0xc3eACf0612346366Db554C991D7858716db09f58",
    icon: "/featured-apps/icons/stargate.webp",
    description: "Deep liquidity bridging into Ink.",
    assetIcons: ["rseth"],
  },
  {
    name: "Aave",
    url: "https://app.aave.com/bridge/",
    icon: "/icons/bridges/aave.svg",
    description: "Bridge GHO and other Aave assets to Ink.",
    assetIcons: ["gho"],
  },
];
