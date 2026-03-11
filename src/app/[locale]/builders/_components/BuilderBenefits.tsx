"use client";

import { useTranslations } from "next-intl";

import { ColoredText } from "@/components/ColoredText";

const BENEFIT_KEYS = ["grants", "marketing", "gtm", "tech"] as const;

export const BuilderBenefits = () => {
  const t = useTranslations("Builders.benefits");

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <ColoredText className="ink:text-h3" variant="purple" dampen="md">
          {t("title")}
        </ColoredText>
        <p className="ink:text-body-2-regular ink:text-text-muted max-w-3xl">
          {t("description")}
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {BENEFIT_KEYS.map((key) => (
          <div
            key={key}
            className="flex flex-col justify-end aspect-[4/5] p-5 rounded-2xl border border-blackMagic/10 dark:border-whiteMagic/10 bg-background"
          >
            <p className="ink:text-body-2-bold">{t(key)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
