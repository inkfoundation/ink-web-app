import { appCategories } from "./categories";
import {
  type InkApp,
  type InkAppFilters,
  type InkAppNetwork,
  inkFeaturedApps,
} from "./InkApp";

export function normalizeAppPath(pathname: string) {
  return pathname.replace(/^\/en-US(?=\/|$)/, "") || "/";
}

export function isAppsPath(pathname: string) {
  const path = normalizeAppPath(pathname);
  return path === "/apps" || path.startsWith("/apps/");
}

export function getCategoryFromPath(pathname: string): string | null {
  const path = normalizeAppPath(pathname);
  if (!path.startsWith("/apps/")) return null;
  let value = path.slice("/apps/".length).split("/")[0];
  try {
    value = decodeURIComponent(value);
  } catch {
    return null;
  }
  return isAppCategory(value) ? value : null;
}

export function isAppCategory(
  value: string | null | undefined
): value is string {
  return !!value && appCategories.some((category) => category.value === value);
}

export function getNetwork(networkSearchParam: string | null): InkAppNetwork {
  if (networkSearchParam === "Both" || networkSearchParam === "Testnet") {
    return networkSearchParam;
  }
  return "Mainnet";
}

export function parseAppFilters({
  category,
  tags,
  search,
  network,
}: {
  category?: string | null;
  tags?: string | null;
  search?: string | null;
  network?: string | null;
}): InkAppFilters {
  const categories = (category ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(isAppCategory);

  return {
    search: search ?? "",
    categories,
    tags: tags ? tags.split(",").filter(Boolean) : [],
    network: getNetwork(network ?? null),
  };
}

export function hasActiveFilters(filters: InkAppFilters): boolean {
  return (
    (filters.network && filters.network !== "Mainnet") ||
    (filters.categories && filters.categories.length > 0) ||
    (filters.tags && filters.tags.length > 0)
  );
}

export function hasActiveFiltersOrSearch(filters: InkAppFilters): boolean {
  return !!filters.search || hasActiveFilters(filters);
}

export function filterInkApps(
  apps: InkApp[],
  filters: InkAppFilters
): InkApp[] {
  const searchTerm = filters.search.trim().toLowerCase();

  return apps.filter((app) => {
    if (
      filters.network === "Mainnet" &&
      app.network !== "Mainnet" &&
      app.network !== "Both"
    ) {
      return false;
    }
    if (
      filters.network === "Testnet" &&
      app.network !== "Testnet" &&
      app.network !== "Both"
    ) {
      return false;
    }

    if (
      filters.categories.length > 0 &&
      !app.category.some((category) =>
        filters.categories.includes(category.toLowerCase())
      )
    ) {
      return false;
    }

    if (
      filters.tags.length > 0 &&
      !app.tags.some((tag) => filters.tags.includes(tag))
    ) {
      return false;
    }

    if (
      searchTerm &&
      !app.name.toLowerCase().includes(searchTerm) &&
      !app.description.toLowerCase().includes(searchTerm) &&
      !app.category.some((category) =>
        category.toLowerCase().includes(searchTerm)
      ) &&
      !app.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
    ) {
      return false;
    }

    return true;
  });
}

export function sortAppsForBoard(apps: InkApp[]): InkApp[] {
  const featuredIds = new Set(inkFeaturedApps.map((app) => app.id));
  const featured = inkFeaturedApps.filter((app) =>
    apps.some((candidate) => candidate.id === app.id)
  );
  return [...featured, ...apps.filter((app) => !featuredIds.has(app.id))];
}
