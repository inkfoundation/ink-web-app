"use client";

import { useTheme } from "next-themes";

import { MoonIcon } from "@/components/icons/MoonIcon";
import { SidebarIcon } from "@/components/icons/SidebarIcon";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { classNames } from "@/util/classes";

export const FloatingSideControls = () => {
  const { theme, setTheme } = useTheme();
  const { toggleCollapsed, isCollapsed } = useSidebarContext();

  return (
    <div
      className={classNames(
        // Hide on mobile, show on desktop (lg breakpoint matches ink-kit sidebar visibility)
        "hidden lg:flex",
        // Fixed positioning on the left side
        "fixed left-[30px] z-40",
        // Responsive vertical positioning:
        // - On short screens: fixed at 454px from top
        // - On tall screens (>~1076px): moves toward center
        "top-[max(454px,calc(50%-84px))]",
        // Solid background matching page bg with rounded corners
        "bg-[#f0efff] dark:bg-[#160f1f]",
        "rounded-full",
        "p-2",
        // Layout
        "flex-col gap-1"
      )}
    >
      {/* Theme Toggle Button */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label={
          theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
        className={classNames(
          "group cursor-pointer",
          "w-10 h-10 rounded-full",
          "flex items-center justify-center",
          "transition-all duration-200",
          // Theme-aware colors matching sidebar menu items
          "text-black/50 hover:text-black/80 dark:text-white/50 dark:hover:text-white/80",
          "hover:bg-black/5 dark:hover:bg-white/10",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:focus-visible:ring-white/30"
        )}
      >
        <MoonIcon className="w-4 h-4" />
      </button>

      {/* Sidebar Toggle Button */}
      <button
        onClick={toggleCollapsed}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!isCollapsed}
        className={classNames(
          "group cursor-pointer",
          "w-10 h-10 rounded-full",
          "flex items-center justify-center",
          "transition-all duration-200",
          // Theme-aware colors matching sidebar menu items
          "text-black/50 hover:text-black/80 dark:text-white/50 dark:hover:text-white/80",
          "hover:bg-black/5 dark:hover:bg-white/10",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:focus-visible:ring-white/30",
          isCollapsed && "bg-black/5 dark:bg-white/5"
        )}
      >
        <SidebarIcon className="w-4 h-4" />
      </button>
    </div>
  );
};
