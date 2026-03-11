"use client";

import { useTranslations } from "next-intl";

import { ColoredText } from "@/components/ColoredText";

export const ReadyToInk = () => {
  const t = useTranslations("Builders.readyToInk");

  return (
    <div className="flex flex-col gap-4 max-w-3xl bg-background rounded-2xl p-6 -m-6">
      <ColoredText className="ink:text-h3" variant="purple" dampen="md">
        {t("title")}
      </ColoredText>
      <p className="ink:text-body-2-regular ink:text-text-muted">
        {t("description")}
      </p>
    </div>
  );
};
