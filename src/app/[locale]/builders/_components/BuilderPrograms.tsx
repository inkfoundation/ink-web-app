"use client";

import { PropsWithChildren } from "react";
import { useTranslations } from "next-intl";

import { ColoredText } from "@/components/ColoredText";
import { EXTERNAL_LINKS, Link } from "@/routing";
import { classNames } from "@/util/classes";

const PROGRAM_KEYS = ["spark", "forge", "echo"] as const;

const CLOSED_PROGRAMS = new Set<string>(["echo"]);

const PROGRAM_LINKS = {
  spark: {
    learn: EXTERNAL_LINKS.sparkProgram,
    apply: EXTERNAL_LINKS.sparkApply,
  },
  forge: {
    learn: EXTERNAL_LINKS.forgeProgram,
    apply: EXTERNAL_LINKS.forgeApply,
  },
  echo: { learn: EXTERNAL_LINKS.echoProgram, apply: EXTERNAL_LINKS.echoApply },
} satisfies Record<string, { learn: string; apply: string }>;

const GradientTag = ({ children }: PropsWithChildren) => (
  <div className="self-start rounded-full p-px bg-linear-to-r from-blackMagic/30 to-gradientPurple dark:from-whiteMagic/80 dark:to-gradientPurple">
    <div className="px-5 py-2 rounded-full bg-background">
      <span className="inline-block text-transparent bg-clip-text bg-linear-to-r from-blackMagic/70 to-gradientPurple dark:from-whiteMagic dark:to-gradientPurple ink:text-body-3-bold">
        {children}
      </span>
    </div>
  </div>
);

export const BuilderPrograms = () => {
  const t = useTranslations("Builders.programs");

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {PROGRAM_KEYS.map((key) => {
          const closed = CLOSED_PROGRAMS.has(key);
          return (
            <div
              key={key}
              className={classNames(
                "flex flex-col gap-6 p-6 rounded-2xl border bg-background",
                closed
                  ? "border-blackMagic/5 dark:border-whiteMagic/5"
                  : "border-blackMagic/10 dark:border-whiteMagic/10"
              )}
            >
              <div className={classNames("flex flex-col gap-6", closed && "opacity-50")}>
                <GradientTag>{t(`${key}.tag`)}</GradientTag>
                <div className="flex flex-col gap-3 flex-1">
                  <h3 className="ink:text-h4">{t(`${key}.title`)}</h3>
                  <p className="ink:text-body-3-regular ink:text-text-muted">
                    {t(`${key}.description`)}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link
                    href={PROGRAM_LINKS[key].learn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-full border border-blackMagic/20 text-blackMagic dark:border-whiteMagic/20 dark:text-whiteMagic ink:text-body-3-bold hover:opacity-80 transition-opacity"
                  >
                    {t(`${key}.learnMore`)}
                  </Link>
                  {closed ? (
                    <span className="px-4 py-2 rounded-full border border-blackMagic/10 dark:border-whiteMagic/10 ink:text-text-muted ink:text-body-3-bold">
                      {t(`${key}.apply`)}
                    </span>
                  ) : (
                    <Link
                      href={PROGRAM_LINKS[key].apply}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-full bg-blackMagic text-whiteMagic dark:bg-whiteMagic dark:text-blackMagic ink:text-body-3-bold hover:opacity-90 transition-opacity"
                    >
                      {t(`${key}.apply`)}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
