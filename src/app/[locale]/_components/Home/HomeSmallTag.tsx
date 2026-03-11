"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export const HomeSmallTag = () => {
  const t = useTranslations("Home");
  return (
    <div className="flex flex-col items-start w-full ink:text-body-3-regular ink:text-text-default -mb-8 lg:-mb-12">
      <div className="flex items-center justify-center ink:gap-1">
        <Image
          alt="a lightning bolt in a circle"
          src="/icons/1s-block-times.svg"
          width={20}
          height={20}
        />
        <div>{t("pre")}</div>
      </div>
    </div>
  );
};
