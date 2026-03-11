"use client";

import { Suspense } from "react";
import { InkLayout } from "@inkonchain/ink-kit";

import { ConnectWalletButton } from "@/components/ConnectWalletButton";

import { FloatingSideControls } from "./FloatingSideControls";
import { InkLogo, InkLogoImage } from "./InkLogo";
import { MobileNav } from "./MobileNav";
import { SideNav } from "./SideNav";

export function RoutedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FloatingSideControls />
      <InkLayout
        className="flex-1"
        mainIcon={
          <Suspense fallback={<InkLogoImage />}>
            <InkLogo />
          </Suspense>
        }
        headerContent={
          <ConnectWalletButton
            shrinkOnMobile
            walletPill
            className="[.light_&]:bg-blackMagic/90 [.light_&]:!text-whiteMagic"
          />
        }
        mobileNavigation={<MobileNav />}
        sideNavigation={<SideNav />}
      >
        {children}
      </InkLayout>
    </>
  );
}
