"use client";

import { useEffect, useState } from "react";
import {
  InkIcon,
  InkLayoutSideNav,
  useModalContext,
} from "@inkonchain/ink-kit";

import { CONTACT_US_MODAL_KEY } from "@/components/Modals";
import { useRouterQuery } from "@/hooks/useRouterQuery";
import {
  hrefObjectFromHrefPropWithQuery,
  Link,
  pathFromHrefProp,
  usePathname,
} from "@/routing";

import { useLinks } from "./links";
import { ThemeToggle } from "./ThemeToggle";

export const SideNav = () => {
  const links = useLinks();

  const query = useRouterQuery();
  const path = usePathname();

  const [selected, setSelected] = useState(path);
  const { openModal } = useModalContext(CONTACT_US_MODAL_KEY);

  useEffect(() => {
    setSelected(path);
  }, [path]);

  return (
    <InkLayoutSideNav
      bottom={
        <div>
          <ThemeToggle />
        </div>
      }
      links={[
        ...links.map(({ href, icon, label, exactHref }) => {
          const hrefPath = pathFromHrefProp(href);
          return {
            href,
            asChild: true,
            leftIcon: icon,
            active: exactHref
              ? selected === hrefPath
              : selected.startsWith(hrefPath),
            children: (
              <Link
                href={hrefObjectFromHrefPropWithQuery(href, query)}
                prefetch
                onClick={() => {
                  setSelected(href);
                }}
              >
                {label}
              </Link>
            ),
          };
        }),
        {
          href: "#contact",
          asChild: true,
          leftIcon: <InkIcon.Mail />,
          active: false,
          children: (
            <button className="cursor-pointer" onClick={openModal}>
              Contact
            </button>
          ),
        },
      ]}
    />
  );
};
