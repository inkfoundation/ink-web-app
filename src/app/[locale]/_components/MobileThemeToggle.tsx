"use client";

import { useTheme } from "next-themes";

import { MoonIcon } from "@/components/icons/MoonIcon";
import { SunIcon } from "@/components/icons/SunIcon";
import { classNames } from "@/util/classes";

export const MobileThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={classNames(
        "flex items-center justify-center gap-1",
        "p-1 rounded-full",
        "bg-black/5 dark:bg-white/5"
      )}
    >
      {/* Light mode button */}
      <button
        onClick={() => setTheme("light")}
        aria-label="Switch to light mode"
        aria-pressed={theme === "light"}
        className={classNames(
          "flex items-center justify-center",
          "w-10 h-10 rounded-full",
          "transition-all duration-200",
          theme === "light"
            ? "bg-black/10 text-black/80 dark:bg-white/20 dark:text-white"
            : "text-black/40 hover:text-black/60 dark:text-white/40 dark:hover:text-white/60"
        )}
      >
        <SunIcon />
      </button>

      {/* Dark mode button */}
      <button
        onClick={() => setTheme("dark")}
        aria-label="Switch to dark mode"
        aria-pressed={theme === "dark"}
        className={classNames(
          "flex items-center justify-center",
          "w-10 h-10 rounded-full",
          "transition-all duration-200",
          theme === "dark"
            ? "bg-black/10 text-black/80 dark:bg-white/20 dark:text-white"
            : "text-black/40 hover:text-black/60 dark:text-white/40 dark:hover:text-white/60"
        )}
      >
        <MoonIcon />
      </button>
    </div>
  );
};
