"use client";

import { useTheme } from "next-themes";

import { MoonIcon } from "@/components/icons/MoonIcon";
import { SunIcon } from "@/components/icons/SunIcon";

export const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="group flex items-center justify-center rounded-full p-1 transition-all duration-200 hover:bg-default/8 cursor-pointer"
    >
      <div className="size-8 flex items-center justify-center">
        {isDark ? <SunIcon /> : <MoonIcon />}
      </div>
    </button>
  );
};
