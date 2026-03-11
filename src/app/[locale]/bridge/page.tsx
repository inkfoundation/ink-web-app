import Image from "next/image";

import { ColoredText } from "@/components/ColoredText";
import { newLayoutContainerClasses } from "@/components/styles/container";

interface Bridge {
  name: string;
  url: string;
  icon: string;
  assetIcons: string[];
}

const bridges: Bridge[] = [
  {
    name: "Kraken",
    url: "https://www.kraken.com/",
    icon: "/icons/kraken-icon.svg",
    assetIcons: ["kbtc", "usdg"],
  },
  {
    name: "Bungee",
    url: "https://www.bungee.exchange/?intro=true&toChainId=57073&toTokenAddress=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee&fromChainId=1&fromTokenAddress=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    icon: "/featured-apps/icons/bungee.webp",
    assetIcons: ["eth", "usdt0", "usdc"],
  },
  {
    name: "Super Bridge",
    url: "https://superbridge.app/?fromChainId=1&toChainId=57073",
    icon: "/featured-apps/icons/superbridge.webp",
    assetIcons: ["eth", "usdc"],
  },
  {
    name: "USDT0 Native Bridge",
    url: "https://usdt0.to/transfer?source=ethereum&destination=ink",
    icon: "/icons/USDT0.svg",
    assetIcons: ["usdt0"],
  },
  {
    name: "Stargate",
    url: "https://stargate.finance/?srcChain=ethereum&srcToken=0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7&dstChain=ink&dstToken=0xc3eACf0612346366Db554C991D7858716db09f58",
    icon: "/featured-apps/icons/stargate.webp",
    assetIcons: ["rseth"],
  },
  {
    name: "Aave",
    url: "https://app.aave.com/bridge/",
    icon: "/icons/bridges/aave.svg",
    assetIcons: ["gho"],
  },
];

export default function BridgePage() {
  return (
    <div className={newLayoutContainerClasses()}>
      <ColoredText className="ink:text-h2 lg:hidden" variant="purple">
        Bridge
      </ColoredText>

      {/* Mobile: List layout */}
      <div className="flex flex-col gap-2 w-full md:hidden">
        {bridges.map((bridge) => (
          <a
            key={bridge.name}
            href={bridge.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-xl ink:bg-background-container hover:opacity-80 transition-opacity"
          >
            <Image
              src={bridge.icon}
              alt={bridge.name}
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="font-medium flex-1">{bridge.name}</span>
            <div className="flex items-center gap-1">
              {bridge.assetIcons.map((icon) => (
                <Image
                  key={icon}
                  src={`/icons/tokens/${icon}.svg`}
                  alt={icon}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
              ))}
            </div>
          </a>
        ))}
      </div>

      {/* Desktop: Tile layout */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl mx-auto">
        {bridges.map((bridge) => (
          <a
            key={bridge.name}
            href={bridge.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-4 p-6 rounded-2xl ink:bg-background-container hover:opacity-80 transition-opacity"
          >
            <div className="w-16 h-16 flex items-center justify-center">
              <Image
                src={bridge.icon}
                alt={bridge.name}
                width={64}
                height={64}
                className="rounded-xl object-contain max-h-16"
              />
            </div>
            <span className="font-semibold text-lg">{bridge.name}</span>
            <div className="flex items-center gap-1">
              {bridge.assetIcons.map((icon) => (
                <Image
                  key={icon}
                  src={`/icons/tokens/${icon}.svg`}
                  alt={icon}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
