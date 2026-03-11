"use client";
import { Card, CardContent, InkIcon } from "@inkonchain/ink-kit";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { FlyWhenIntoView } from "@/components/FlyWhenIntoView";
import { newLayoutSectionClasses } from "@/components/styles/container";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { EXTERNAL_LINKS, Link } from "@/routing";
import { classNames } from "@/util/classes";

import { PageHeader } from "../../_components/PageHeader";

const SocialIcon = ({ src, alt }: { src: string; alt: string }) => (
  <Image
    src={src}
    alt={alt}
    width={48}
    height={48}
    className="[.light_&]:brightness-50 [.light_&]:contrast-125"
  />
);

export const LetsGetSocial = () => {
  const t = useTranslations("Community");
  const walletColumn = useFeatureFlag("walletColumn");

  return (
    <FlyWhenIntoView className={newLayoutSectionClasses()}>
      <div className="flex flex-col gap-6 items-start">
        <PageHeader
          title={t("letsGetSocial.title")}
          description={t("letsGetSocial.description")}
          size="section"
        />
      </div>
      <div
        className={classNames(
          "grid gap-6 self-center",
          "[.light_&]:[--ink-background-container:rgba(187,180,255,0.15)]",
          walletColumn
            ? "xl:grid-cols-4 sm:grid-cols-2"
            : "lg:grid-cols-4 sm:grid-cols-2"
        )}
      >
        <Card className="w-full" variant="secondary" clickable asChild>
          <Link
            href={EXTERNAL_LINKS.twitter}
            target="_blank"
            rel="noopener noreferrer"
          >
            <CardContent.Link
              title={t("twitter.title")}
              description={t("twitter.description")}
              icon={<SocialIcon src="/icons/social/x.svg" alt="X" />}
              linkIcon={<ExternalLinkArrow />}
            />
          </Link>
        </Card>
        <Card variant="secondary" clickable asChild>
          <Link
            href={EXTERNAL_LINKS.discord}
            target="_blank"
            rel="noopener noreferrer"
          >
            <CardContent.Link
              title={t("discord.title")}
              description={t("discord.description")}
              icon={
                <SocialIcon src="/icons/social/discord.svg" alt="Discord" />
              }
              linkIcon={<ExternalLinkArrow />}
            />
          </Link>
        </Card>
        <Card variant="secondary" clickable asChild>
          <Link
            href={EXTERNAL_LINKS.telegram}
            target="_blank"
            rel="noopener noreferrer"
          >
            <CardContent.Link
              title={t("telegram.title")}
              description={t("telegram.description")}
              icon={
                <SocialIcon src="/icons/social/telegram.svg" alt="Telegram" />
              }
              linkIcon={<ExternalLinkArrow />}
            />
          </Link>
        </Card>
        <Card variant="secondary" clickable asChild>
          <Link
            href={EXTERNAL_LINKS.farcaster}
            target="_blank"
            rel="noopener noreferrer"
          >
            <CardContent.Link
              title={t("farcaster.title")}
              description={t("farcaster.description")}
              icon={
                <SocialIcon src="/icons/social/farcaster.svg" alt="Farcaster" />
              }
              linkIcon={<ExternalLinkArrow />}
            />
          </Link>
        </Card>
      </div>
    </FlyWhenIntoView>
  );
};

const ExternalLinkArrow = () => {
  return <InkIcon.Arrow className="size-4 rotate-225" />;
};
