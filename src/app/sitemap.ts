import { MetadataRoute } from "next";

import { env } from "@/env";
import { routing } from "@/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const basicPaths = ["bridge", "faucet", "terms"];

  return [
    {
      url: env.ORIGIN,
      priority: 1,
    },
    ...basicPaths.flatMap((path) =>
      routing.locales.map((lang) => ({
        url:
          env.ORIGIN +
          (lang !== routing.defaultLocale ? "/" + lang : "") +
          "/" +
          path,
      }))
    ),
  ];
}
