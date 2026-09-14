"use client";
import { Suspense } from "react";
import { InkLayout } from "@inkonchain/ink-kit";

import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { Footer } from "@/components/Footer";
import { usePathname } from "@/routing";

import { isAppsPath } from "../apps/_components/filter-apps";

import { HomeBoard } from "./HomeBoard";
import { InkLogo, InkLogoImage } from "./InkLogo";
import { LayoutColumns } from "./LayoutColumns";
import { MainPageBackground } from "./MainPageBackground";
import { MobileNav } from "./MobileNav";
import { SideNav } from "./SideNav";
import { ThemeToggle } from "./ThemeToggle";

const isBoardPath = (pathname: string) =>
  pathname === "/" ||
  isAppsPath(pathname) ||
  pathname === "/bridge" ||
  pathname === "/builders";

export function RoutedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isBoardPath(pathname)) {
    return (
      <>
        {children}
        <HomeBoard />
      </>
    );
  }

  return (
    <InkLayout
      mainIcon={
        <Suspense fallback={<InkLogoImage />}>
          <InkLogo />
        </Suspense>
      }
      headerContent={
        <div className="flex gap-2 items-center">
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>
          <ConnectWalletButton shrinkOnMobile />
        </div>
      }
      mobileNavigation={<MobileNav />}
      sideNavigation={<SideNav />}
    >
      <div className="relative pt-0 overflow-hidden flex flex-col gap-8 w-full items-center">
        <div className="flex flex-col w-full items-center min-h-[80vh]">
          <LayoutColumns>{children}</LayoutColumns>
        </div>
        <Footer />
      </div>
      <MainPageBackground />
    </InkLayout>
  );
}
