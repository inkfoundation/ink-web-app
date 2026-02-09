"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { ColoredText } from "@/components/ColoredText";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { EXTERNAL_LINKS, Link } from "@/routing";
import { classNames } from "@/util/classes";

const FAQ_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;

export const StartInking = () => {
  const t = useTranslations("Builders");
  const isMainnet = useFeatureFlag("mainnet");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const links = [
    {
      label: t("startInking.docs"),
      href: EXTERNAL_LINKS.documentation,
      external: true,
    },
    {
      label: t("startInking.inkKit"),
      href: EXTERNAL_LINKS.inkKit,
      external: true,
    },
    {
      label: t("startInking.status"),
      href: EXTERNAL_LINKS.status,
      external: true,
    },
    {
      label: t("startInking.explorer"),
      href: isMainnet
        ? EXTERNAL_LINKS.mainnetExplorerBlockscout
        : EXTERNAL_LINKS.testnetExplorerBlockscout,
      external: true,
    },
    {
      label: t("startInking.testnetFaucet"),
      href: "/faucet" as const,
      external: false,
    },
    {
      label: t("startInking.github"),
      href: EXTERNAL_LINKS.github,
      external: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
      <div className="flex flex-col gap-6">
        <ColoredText className="ink:text-h3" variant="purple" dampen="md">
          {t("startInking.title")}
        </ColoredText>
        <div className="flex flex-col gap-3">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="flex items-center justify-between px-5 py-4 rounded-xl bg-background border border-blackMagic/10 dark:border-whiteMagic/10 hover:brightness-95 dark:hover:brightness-110 transition-[filter]"
            >
              <span className="ink:text-body-2-regular">{link.label}</span>
              <span className="ink:text-text-muted text-sm">&#x2197;</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <ColoredText className="ink:text-h3" variant="purple" dampen="md">
          {t("faqs.title")}
        </ColoredText>
        <div className="flex flex-col gap-3">
          {FAQ_KEYS.map((key, index) => {
            const isOpen = openIndex === index;
            return (
              <button
                key={key}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex flex-col px-5 py-4 rounded-xl bg-background border border-blackMagic/10 dark:border-whiteMagic/10 text-left transition-colors hover:brightness-95 dark:hover:brightness-110 cursor-pointer"
              >
                <div className="flex items-center justify-between gap-3 w-full">
                  <div className="flex items-start gap-2">
                    <span className="ink:text-body-3-regular ink:text-text-muted shrink-0">
                      {index + 1}.
                    </span>
                    <span className="ink:text-body-2-regular">
                      {t(`faqs.q${key}`)}
                    </span>
                  </div>
                  <span
                    className={classNames(
                      "ink:text-text-muted shrink-0 transition-transform duration-200",
                      isOpen && "rotate-90"
                    )}
                  >
                    &#x203A;
                  </span>
                </div>
                <div
                  className={classNames(
                    "grid transition-[grid-template-rows] duration-200 ease-out",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="pt-3 pl-6 ink:text-body-3-regular ink:text-text-muted">
                      {t(`faqs.a${key}`)}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
