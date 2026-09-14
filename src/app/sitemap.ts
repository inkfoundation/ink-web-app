import { MetadataRoute } from "next";

import { appCategories } from "@/app/[locale]/apps/_components/categories";
import { env } from "@/env";
import { routing } from "@/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const appCategoryPaths = appCategories
    .map((category) => category.value)
    .filter((value): value is NonNullable<typeof value> => value !== null)
    .map((value) => `apps/${value}`);
  const basicPaths = [
    "apps",
    ...appCategoryPaths,
    "bridge",
    "builders",
    "faucet",
    "terms",
  ];

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
