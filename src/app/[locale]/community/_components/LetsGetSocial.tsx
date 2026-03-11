"use client";
import { Card, CardContent, InkIcon } from "@inkonchain/ink-kit";
import { useTranslations } from "next-intl";

import { FlyWhenIntoView } from "@/components/FlyWhenIntoView";
import { newLayoutSectionClasses } from "@/components/styles/container";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { EXTERNAL_LINKS, Link } from "@/routing";
import { classNames } from "@/util/classes";

import { PageHeader } from "../../_components/PageHeader";

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
              icon={<InkIcon.Social.X />}
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
              icon={<InkIcon.Social.Telegram />}
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
              icon={<InkIcon.Social.Farcaster />}
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
