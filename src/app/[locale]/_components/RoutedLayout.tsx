import { Suspense } from "react";
import { InkLayout } from "@inkonchain/ink-kit";

import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { OnlyWithFeatureFlag } from "@/components/OnlyWithFeatureFlag";

import { VerifiedBadge } from "../verify/_components/VerifiedBadge";

import { InkLogo, InkLogoImage } from "./InkLogo";
import { MobileNav } from "./MobileNav";
import { SideNav } from "./SideNav";

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
          <OnlyWithFeatureFlag flag="verifyPage">
            <VerifiedBadge />
          </OnlyWithFeatureFlag>
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
