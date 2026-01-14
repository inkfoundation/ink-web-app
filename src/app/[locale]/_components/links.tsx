import { useMemo } from "react";
import { InkIcon } from "@inkonchain/ink-kit";

import { useBridgeAvailability } from "@/hooks/useBridgeAvailability";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { Link, Pathnames, usePathname } from "@/routing";
import { FeatureFlagKey } from "@/util/feature-flags";

interface Link {
  href: Pathnames;
  icon: React.ReactNode;
  label: string;
  exactHref?: boolean;
  flagKey?: FeatureFlagKey;
  onlyIfOnPath?: boolean;
}

const links = [
  {
    href: "/",
    icon: <InkIcon.Home />,
    label: "Home",
    exactHref: true,
  },
  {
    href: "/apps",
    icon: <InkIcon.Apps />,
    label: "Apps",
  },
  {
    href: "/bridge",
    icon: <InkIcon.Bridge />,
    label: "Bridge",
  },
  {
    href: "/verify",
    icon: <InkIcon.VerifiedIcon />,
    label: "Kraken Verify ",
    flagKey: "verifyPage",
  },
  {
    href: "/builders",
    icon: <InkIcon.Code />,
    label: "Build",
  },
  {
    href: "/community",
    icon: <InkIcon.Users />,
    label: "Community",
  },
  {
    href: "/about",
    icon: <InkIcon.Info />,
    label: "About",
  },
  {
    href: "/faucet",
    icon: <InkIcon.Deposit />,
    label: "Faucet",
    onlyIfOnPath: true,
  },
] satisfies Link[];

export function useLinks() {
  const pathname = usePathname();
  const verifyPage = useFeatureFlag("verifyPage");
  const { isAvailable: isBridgeAvailable } = useBridgeAvailability();
  const flags = useMemo(
    () => ({
      verifyPage,
    }),
    [verifyPage]
  );

  const filteredLinks = useMemo(
    () =>
      links.filter((link) => {
        // Hide bridge link if bridge is not available
        if (link.href === "/bridge") {
          return isBridgeAvailable;
        }
        if (link.flagKey) {
          return flags[link.flagKey];
        }
        if (link.onlyIfOnPath) {
          return pathname.includes(link.href);
        }
        return true;
      }),
    [flags, pathname, isBridgeAvailable]
  );

  return filteredLinks;
}
