"use client";

import {
  InkIcon,
  InkLayoutMobileNav,
  useInkLayoutContext,
  useModalContext,
} from "@inkonchain/ink-kit";

import { CONTACT_US_MODAL_KEY } from "@/components/Modals";
import { useRouterQuery } from "@/hooks/useRouterQuery";
import { Link } from "@/routing";

import { useLinks } from "./links";
import { ThemeToggle } from "./ThemeToggle";

export function MobileNav() {
  const { setIsMobileNavOpen } = useInkLayoutContext();

  function closeMobileNavigation() {
    setIsMobileNavOpen(false);
  }

  const query = useRouterQuery();
  const links = useLinks();

  const { openModal } = useModalContext(CONTACT_US_MODAL_KEY);

  return (
    <InkLayoutMobileNav
      bottom={
        <div className="flex justify-center">
          <ThemeToggle />
        </div>
      }
      links={[
        ...links.map(({ href, icon, label }) => ({
          href,
          asChild: true,
          leftIcon: icon,
          children: (
            <Link
              href={{ pathname: href, query }}
              onClick={closeMobileNavigation}
              prefetch
            >
              {label}
            </Link>
          ),
        })),
        {
          href: "#contact",
          asChild: true,
          leftIcon: <InkIcon.Mail />,
          children: (
            <button
              className="cursor-pointer"
              onClick={() => {
                closeMobileNavigation();
                openModal();
              }}
            >
              Contact
            </button>
          ),
        },
      ]}
    />
  );
}
