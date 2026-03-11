import { MetadataRoute } from "next";

import { env } from "@/env";

export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === "production";

  return {
    rules: isProduction
      ? {
          userAgent: "*",
          allow: "/",
        }
      : {
          userAgent: "*",
          disallow: "/",
        },
    sitemap: isProduction ? env.ORIGIN + "/sitemap.xml" : undefined,
  };
}
