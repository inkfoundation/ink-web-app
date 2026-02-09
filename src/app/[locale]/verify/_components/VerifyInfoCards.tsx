"use client";

import { Card } from "@inkonchain/ink-kit";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { EXTERNAL_LINKS, Link } from "@/routing";

export function VerifyInfoCards() {
  const t = useTranslations("Verify.infoCards");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card variant="secondary">
        <div className="flex flex-col lg:flex-row items-center gap-6 p-6">
          <Image
            src="/verify/verify-tick-illustration.png"
            alt="A checkmark illustration"
            width={120}
            height={120}
            className="shrink-0"
          />
          <div className="flex flex-col gap-2 text-center lg:text-left">
            <h3 className="ink:text-body-2-bold">
              {t("whatIsInkVerify.title")}
            </h3>
            <p className="ink:text-body-2-regular ink:text-text-muted">
              {t.rich("whatIsInkVerify.description", {
                "eas-link": (chunks) => (
                  <Link
                    href={EXTERNAL_LINKS.easAttest}
                    className="text-[var(--ink-text-on-secondary)] inline-flex items-center gap-0.5"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {chunks}
                    <span className="text-xs">&#x2197;</span>
                  </Link>
                ),
              })}
            </p>
          </div>
        </div>
      </Card>
      <Card variant="secondary">
        <div className="flex flex-col lg:flex-row items-center gap-6 p-6">
          <Image
            src="/verify/verify-padlock-illustration.png"
            alt="A padlock illustration"
            width={120}
            height={120}
            className="shrink-0"
          />
          <div className="flex flex-col gap-2 text-center lg:text-left">
            <h3 className="ink:text-body-2-bold">{t("whyVerify.title")}</h3>
            <p className="ink:text-body-2-regular ink:text-text-muted">
              {t("whyVerify.description")}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
