import { NextResponse } from "next/server";

import {
  type InkApp,
  inkApps,
  inkAppsNewestFirst,
  inkFeaturedApps,
} from "@/app/[locale]/apps/_components/InkApp";
import { env } from "@/env";

export const revalidate = 300;

// Public, read-only view of the ecosystem apps list for other Ink properties
// (e.g. portal.inkfnd.com). Icons are stored as site-relative paths, so they
// are made absolute against this site's origin.
function withAbsoluteImageUrl(app: InkApp): InkApp {
  return { ...app, imageUrl: new URL(app.imageUrl, env.ORIGIN).toString() };
}

export function GET() {
  return NextResponse.json(
    {
      apps: inkApps.map(withAbsoluteImageUrl),
      featuredIds: inkFeaturedApps.map((app) => app.id),
      newestIds: inkAppsNewestFirst.map((app) => app.id),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
      },
    }
  );
}
