"use client";

import { useEffect } from "react";

import { usePathname } from "@/routing";

export const ScrollToTop = () => {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};
