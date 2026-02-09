"use client";

import React from "react";
import ReactDOM from "react-dom";
import Image from "next/image";

import { usePathname } from "@/routing";

const BACKGROUND_IMAGES: Record<
  string,
  { src: string; width: number; height: number }
> = {
  "/": {
    src: "/bg/top-right-home.png",
    width: 600,
    height: 400,
  },
  "/verify": {
    src: "/bg/top-right-verify.png",
    width: 500,
    height: 625,
  },
  "/builders": {
    src: "/bg/top-right-build.png",
    width: 600,
    height: 400,
  },
  "/community": {
    src: "/bg/top-right-community.png",
    width: 600,
    height: 400,
  },
};

const ALL_BG_SRCS = Object.values(BACKGROUND_IMAGES).map((bg) => bg.src);

export const MainPageBackground: React.FC = () => {
  const path = usePathname();
  const bg = BACKGROUND_IMAGES[path] ?? null;

  ALL_BG_SRCS.forEach((src) => {
    ReactDOM.preload(src, { as: "image" });
  });

  if (!bg) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute right-0 top-0 w-[300px] sm:w-[400px] lg:w-[600px]"
      style={{ zIndex: -1 }}
    >
      <Image
        src={bg.src}
        alt=""
        width={bg.width}
        height={bg.height}
        className="w-full h-auto"
        priority
      />
    </div>
  );
};
