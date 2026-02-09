"use client";

import { useTranslations } from "next-intl";

import { ColoredText } from "@/components/ColoredText";

const FOCUS_KEYS = [
  "defi",
  "trading",
  "prediction",
  "rwa",
  "creator",
  "ai",
] as const;

export const OurFocus = () => {
  const t = useTranslations("Builders.ourFocus");

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4 bg-background rounded-2xl p-6 -m-6">
        <ColoredText className="ink:text-h3" variant="purple" dampen="md">
          {t("title")}
        </ColoredText>
        <p className="ink:text-body-2-regular ink:text-text-muted max-w-3xl">
          {t("description")}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {FOCUS_KEYS.map((key) => (
          <div
            key={key}
            className="flex flex-col justify-end lg:h-[245px] p-5 rounded-2xl border border-blackMagic/10 dark:border-whiteMagic/10 bg-background"
          >
            <div className="flex flex-col gap-2">
              <h3 className="ink:text-body-1-bold">{t(`${key}.title`)}</h3>
              <p className="ink:text-body-3-regular ink:text-text-muted">
                {t(`${key}.description`)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
