"use client";
import { Tag } from "@inkonchain/ink-kit";
import Image from "next/image";

import { EXTERNAL_LINKS, Link } from "@/routing";

import nadoBg from "./assets/nado-bg.png";

const NadoIcon = () => (
  <svg
    width="60"
    height="60"
    viewBox="0 0 59 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18.8154 35.6392L39.8721 59.0471L41.5138 59.9469H46.5174L47.5622 58.8971V50.4938L46.8159 48.7678L34.0489 34.287C30.8388 30.6852 28.3749 27.3833 23.6698 26.4835L24.2668 24.4576L21.13 24.8338L18.2918 33.987L18.8154 35.6367V35.6392ZM34.8685 9.97929L4.1056 16.5067L2.46387 17.4828L0 21.9082L0.44775 23.3341L7.69009 27.5358L9.48107 27.762L28.3724 23.8603C33.0775 22.8842 37.1831 22.3606 40.3198 18.7588L41.9616 20.4847L43.2314 17.5591L36.5102 10.3555L34.8685 9.98182V9.97929ZM49.1306 36.6127L58.8368 6.60117V4.65157L56.297 0.299936L54.8045 0L47.5622 4.20167L46.4416 5.62765L40.3932 24.0103C38.9007 28.5881 37.2564 32.4136 38.8248 36.9889L36.5102 37.5151L38.3771 40.0671L47.934 37.8913L49.128 36.6153L49.1306 36.6127Z"
      fill="white"
    />
  </svg>
);

export const HomeNado = () => {
  return (
    <Link
      href={EXTERNAL_LINKS.nado}
      target="_blank"
      rel="noopener noreferrer"
      className="block group h-full"
    >
      <div className="flex flex-col h-full ink:bg-background-container ink:rounded-lg overflow-hidden">
        <div
          className="relative w-full h-[220px] shrink-0 overflow-hidden"
          style={{ background: "#000000" }}
        >
          <div className="absolute top-6 left-6 z-10">
            <div className="rounded-2xl size-[80px] border border-blackMagic/10 dark:border-white/10 flex items-center justify-center">
              <NadoIcon />
            </div>
          </div>
          <div className="absolute inset-0" style={{ pointerEvents: "none" }}>
            <Image
              src={nadoBg}
              alt=""
              fill
              style={{
                objectFit: "cover",
                objectPosition: "right top",
              }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-8 p-6 flex-1">
          <div className="ink:text-h5">Nado</div>
          <div className="flex-1 ink:text-body-3-regular ink:text-text-muted">
            One DEX. Perps and spot. Unified Margin. Highly performant central
            limit order book architecture built by the team that brought Kraken
            &amp; Ink.
          </div>
          <div className="flex gap-1 flex-wrap">
            <Tag variant="outline">Borrowing</Tag>
            <Tag variant="outline">Tools</Tag>
          </div>
        </div>
      </div>
    </Link>
  );
};
