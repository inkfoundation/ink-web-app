import { GoogleTagManager } from "@next/third-parties/google";
import { cookies, headers } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import { ConsentLogger } from "@/components/CookieConsent/ConsentLogger";
import { CookieConsent } from "@/components/CookieConsent/CookieConsent";
import "@/components/CookieConsent/onetrust-banner.css";
import { GlobalSvgStuff } from "@/components/icons/GlobalSvgStuff";
import { ContactUsModal } from "@/components/Modals";
import { Providers } from "@/components/Providers";
import { SiteBanner } from "@/components/SiteBanner";
import { ToggleThemeShortcut } from "@/components/ToggleThemeShortcut";
import { clientEnv } from "@/env-client";
import { COOKIE_CONSENT } from "@/integrations/consent";

import { inter, plus_jakarta_sans } from "../fonts";

import { RoutedLayout } from "./_components/RoutedLayout";

const themeClassesMapping: Record<string, string> = {
  dark: "dark ink:dark-theme",
  light: "light ink:light-theme",
};

const homeBoardThemeBootstrap = `
(() => {
  const root = document.documentElement;
  const segments = window.location.pathname.split("/").filter(Boolean);

  if (segments[0] === root.lang) segments.shift();

  const pathname = "/" + segments.join("/");
  const isHomeBoard =
    pathname === "/" ||
    pathname === "/bridge" ||
    pathname === "/builders" ||
    pathname === "/apps" ||
    pathname.startsWith("/apps/");

  if (!isHomeBoard) return;

  let storedTheme = null;
  try {
    storedTheme = window.localStorage.getItem("theme");
  } catch {}

  const classTheme = root.classList.contains("dark")
    ? "dark"
    : root.classList.contains("light")
      ? "light"
      : null;
  const dataTheme =
    root.dataset.theme === "dark" || root.dataset.theme === "light"
      ? root.dataset.theme
      : null;
  const theme =
    classTheme ||
    dataTheme ||
    (storedTheme === "dark" || storedTheme === "light" ? storedTheme : null) ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");

  root.dataset.theme = theme;
  root.setAttribute("data-home-board", "");
})();
`;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const [resolvedCookies, { locale }, messages] = await Promise.all([
    cookies(),
    params,
    getMessages(),
    headers(),
  ]);

  const userHasAcceptedCookiePolicy =
    resolvedCookies.get(COOKIE_CONSENT)?.value === "true";
  const theme = resolvedCookies.get("__theme__")?.value || "system";
  const themeClasses = themeClassesMapping[theme] || "";

  return (
    // suppressHydrationWarning is necessary for next-themese to properly render the right theme without a flash of the wrong theme
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} ${plus_jakarta_sans.variable} ${themeClasses}`}
      data-version={process.env.GITHUB_SHA?.slice(0, 7)}
      {...(theme === "dark" || theme === "light"
        ? { "data-theme": theme }
        : {})}
    >
      {userHasAcceptedCookiePolicy && (
        <>
          <GoogleTagManager gtmId={clientEnv.NEXT_PUBLIC_GTM_ID} />
        </>
      )}

      <meta
        name="theme-color"
        content="#ffffff"
        media="(prefers-color-scheme: light)"
      />
      <meta
        name="theme-color"
        content="#0f0e12"
        media="(prefers-color-scheme: dark)"
      />

      <body>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: homeBoardThemeBootstrap }}
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <ToggleThemeShortcut />

            <SiteBanner />

            <RoutedLayout>{children}</RoutedLayout>

            <CookieConsent />
            <ConsentLogger />

            <ContactUsModal />
          </Providers>
        </NextIntlClientProvider>
        <GlobalSvgStuff />
      </body>
    </html>
  );
}
