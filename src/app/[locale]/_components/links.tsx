import { useMemo } from "react";
import { InkIcon } from "@inkonchain/ink-kit";

import { Link, Pathnames, usePathname } from "@/routing";

interface Link {
  href: Pathnames;
  icon: React.ReactNode;
  label: string;
  exactHref?: boolean;
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

  const filteredLinks = useMemo(
    () =>
      links.filter((link) => {
        if (link.onlyIfOnPath) {
          return pathname.includes(link.href);
        }
        return true;
      }),
    [pathname]
  );

  return filteredLinks;
}
