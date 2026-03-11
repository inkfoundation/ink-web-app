"use server";
import { GoogleTagManager } from "@next/third-parties/google";
import { cookies, headers } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import { ConsentLogger } from "@/components/CookieConsent/ConsentLogger";
import { CookieConsent } from "@/components/CookieConsent/CookieConsent";
import { Footer } from "@/components/Footer";
import { GlobalSvgStuff } from "@/components/icons/GlobalSvgStuff";
import { ContactUsModal, NewsletterModal } from "@/components/Modals";
import { Providers } from "@/components/Providers";
import { ToggleThemeShortcut } from "@/components/ToggleThemeShortcut";
import { clientEnv } from "@/env-client";
import { COOKIE_CONSENT } from "@/integrations/consent";

import { inter, plus_jakarta_sans } from "../fonts";

import { LayoutColumns } from "./_components/LayoutColumns";
import { MainPageBackground } from "./_components/MainPageBackground";
import { RoutedLayout } from "./_components/RoutedLayout";

const themeClassesMapping: Record<string, string> = {
  dark: "dark ink:dark-theme",
  light: "light ink:light-theme",
};

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
    >
      {userHasAcceptedCookiePolicy && (
        <>
          <GoogleTagManager gtmId={clientEnv.NEXT_PUBLIC_GTM_ID} />
        </>
      )}

      <meta
        name="theme-color"
        content="#f0efff"
        media="(prefers-color-scheme: light)"
      />
      <meta
        name="theme-color"
        content="#160f1f"
        media="(prefers-color-scheme: dark)"
      />

      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <ToggleThemeShortcut />

            <RoutedLayout>
              <div className="relative pt-0 overflow-hidden flex flex-col gap-8 w-full items-center">
                <div className="flex flex-col w-full items-center min-h-[80vh]">
                  <LayoutColumns>{children}</LayoutColumns>
                </div>
                <Footer />
              </div>

              <MainPageBackground />
            </RoutedLayout>

            <CookieConsent />
            <ConsentLogger />

            <NewsletterModal />
            <ContactUsModal />
          </Providers>
        </NextIntlClientProvider>
        <GlobalSvgStuff />
      </body>
    </html>
  );
}
