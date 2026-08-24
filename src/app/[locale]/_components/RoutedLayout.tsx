import { Suspense } from "react";
import { InkLayout } from "@inkonchain/ink-kit";

import { ConnectWalletButton } from "@/components/ConnectWalletButton";

import { InkLogo, InkLogoImage } from "./InkLogo";
import { MobileNav } from "./MobileNav";
import { SideNav } from "./SideNav";
import { ThemeToggle } from "./ThemeToggle";

export function RoutedLayout({ children }: { children: React.ReactNode }) {
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
      {children}
    </InkLayout>
  );
}
