"use client";

import { useTranslations } from "next-intl";

import { ColoredText } from "@/components/ColoredText";

const STEPS = ["step1", "step2", "step3"] as const;

export const HowItWorks = () => {
  const t = useTranslations("Builders.howItWorks");

  return (
    <div className="flex flex-col gap-10">
      <ColoredText className="ink:text-h3" variant="purple" dampen="md">
        {t("title")}
      </ColoredText>
      <div className="flex flex-col gap-4">
        {STEPS.map((step, index) => (
          <div
            key={step}
            className="flex gap-6 items-start p-6 rounded-2xl border border-blackMagic/10 dark:border-whiteMagic/10 bg-background"
          >
            <div className="flex items-center justify-center size-10 rounded-full bg-[var(--ink-button-primary)] text-white shrink-0 ink:text-body-2-bold">
              {index + 1}
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="ink:text-body-1-bold">{t(`${step}.title`)}</h3>
              <p className="ink:text-body-2-regular ink:text-text-muted">
                {t(`${step}.description`)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
