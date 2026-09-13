"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

import { usePathname } from "@/routing";
import { hardcodedFeatureFlags } from "@/util/feature-flags";

import {
  filterInkApps,
  getCategoryFromPath,
  hasActiveFilters,
  hasActiveFiltersOrSearch,
  isAppsPath,
  parseAppFilters,
  sortAppsForBoard,
} from "../../apps/_components/filter-apps";
import {
  type InkApp,
  type InkAppFilters,
  inkApps,
} from "../../apps/_components/InkApp";

function localePrefix() {
  return window.location.pathname.startsWith("/en-US") ? "/en-US" : "";
}

function filtersFromLocation() {
  const url = new URL(window.location.href);
  return parseAppFilters({
    category:
      getCategoryFromPath(url.pathname) || url.searchParams.get("category"),
    tags: url.searchParams.get("tags"),
    search: url.searchParams.get("search"),
    network: url.searchParams.get("network"),
  });
}

function writeFilterUrl(filters: InkAppFilters, current: URLSearchParams) {
  const params = new URLSearchParams();
  for (const [key, value] of current.entries()) {
    if (key in hardcodedFeatureFlags) params.set(key, value);
  }
  if (filters.network && filters.network !== "Mainnet") {
    params.set("network", filters.network);
  }
  if (filters.tags.length > 0) params.set("tags", filters.tags.join(","));
  if (filters.search) params.set("search", filters.search);

  const category = filters.categories[0];
  const path = category ? `/apps/${encodeURIComponent(category)}` : "/apps";
  const query = params.toString();
  window.history.pushState(
    null,
    "",
    `${localePrefix()}${path}${query ? `?${query}` : ""}`
  );
}

export function useAppsOverlayFilters() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const wasApps = useRef(isAppsPath(pathname));
  const [filters, setFilters] = useState<InkAppFilters>(() =>
    parseAppFilters({
      category: getCategoryFromPath(pathname) || searchParams.get("category"),
      tags: searchParams.get("tags"),
      search: searchParams.get("search"),
      network: searchParams.get("network"),
    })
  );

  useLayoutEffect(() => {
    setFilters(filtersFromLocation());
  }, []);

  useEffect(() => {
    const nowApps = isAppsPath(pathname);
    if (nowApps !== wasApps.current) {
      setFilters(nowApps ? filtersFromLocation() : parseAppFilters({}));
    }
    wasApps.current = nowApps;
  }, [pathname]);

  useEffect(() => {
    const onPopState = () => setFilters(filtersFromLocation());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const updateFilters = useCallback(
    (next: Partial<InkAppFilters>) => {
      setFilters((prev) => {
        const merged = { ...prev, ...next };
        writeFilterUrl(merged, searchParams);
        return merged;
      });
    },
    [searchParams]
  );

  const resetFilters = useCallback(() => {
    updateFilters({
      network: "Mainnet",
      categories: [],
      tags: [],
    });
  }, [updateFilters]);

  const resetSearch = useCallback(() => {
    updateFilters({ search: "" });
  }, [updateFilters]);

  const overlayApps = useMemo<InkApp[]>(
    () => sortAppsForBoard(filterInkApps(inkApps, filters)),
    [filters]
  );

  return {
    filters,
    overlayApps,
    hasFilters: hasActiveFilters(filters),
    hasFiltersOrSearch: hasActiveFiltersOrSearch(filters),
    updateFilters,
    resetFilters,
    resetSearch,
  };
}
