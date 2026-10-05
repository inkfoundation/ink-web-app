"use client";

import { useTranslations } from "next-intl";

import { newLayoutSectionClasses } from "@/components/styles/container";

const FAUCET_OPTIONS = [
  {
    name: "Alchemy",
    description: "Request Ink Sepolia ETH every 24 hours.",
    href: "https://www.alchemy.com/faucets/ink-sepolia",
  },
  {
    name: "QuickNode",
    description: "Claim Ink Sepolia ETH from QuickNode's faucet.",
    href: "https://faucet.quicknode.com/ink",
  },
  {
    name: "Optimism Superchain",
    description: "Claim test ETH for Ink and other OP Stack chains.",
    href: "https://console.optimism.io/faucet",
  },
];

export function Faucet() {
  const t = useTranslations("Faucet");

  return (
    <div className={newLayoutSectionClasses()}>
      <div className="max-w-(--breakpoint-lg) ink:bg-background-container ink:rounded-lg flex flex-col items-start gap-4 p-6">
        <div className="flex flex-col gap-2">
          <h2 className="ink:text-body-1-bold">{t("maintenanceTitle")}</h2>
          <p className="ink:text-body-2-regular ink:text-text-muted">
            {t("maintenanceDescription")}
          </p>
        </div>
        <ul className="grid w-full gap-3 sm:grid-cols-3">
          {FAUCET_OPTIONS.map((option) => (
            <li key={option.href}>
              <a
                href={option.href}
                target="_blank"
                rel="noopener noreferrer"
                className="ink:rounded-md flex h-full flex-col gap-2 border border-[color:var(--border-subtle,#e7e7e7)] p-4 transition-colors hover:bg-white/5"
              >
                <span className="ink:text-body-2-bold">{option.name}</span>
                <span className="ink:text-body-3-regular ink:text-text-muted">
                  {option.description}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
