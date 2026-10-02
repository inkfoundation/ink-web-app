import { PropsWithChildren, useEffect } from "react";
import { useInkThemeClass } from "@inkonchain/ink-kit";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import { useTheme } from "next-themes";

import { setTheme } from "@/actions/theme";

export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeConsumer>{children}</ThemeConsumer>
    </NextThemeProvider>
  );
};

const ThemeConsumer: React.FC<PropsWithChildren> = ({ children }) => {
  const { resolvedTheme } = useTheme();
  useInkThemeClass(resolvedTheme === "dark" ? "dark" : "light");

  return (
    <>
      <SyncTheme />
      {children}
    </>
  );
};

const SyncTheme = () => {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    if (resolvedTheme && readThemeCookie() !== resolvedTheme) {
      setTheme(resolvedTheme);
    }
  }, [resolvedTheme]);
  return null;
};

function readThemeCookie() {
  return document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("__theme__="))
    ?.slice("__theme__=".length);
}
