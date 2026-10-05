"use client";

import { useTranslations } from "next-intl";

import { newLayoutSectionClasses } from "@/components/styles/container";

const FAUCET_OPTIONS_URL = "https://docs.inkonchain.com/tools/faucets";

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
        <a
          href={FAUCET_OPTIONS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="ink:text-body-2-bold underline underline-offset-4"
        >
          {t("maintenanceCta")}
        </a>
      </div>
    </div>
  );
}
