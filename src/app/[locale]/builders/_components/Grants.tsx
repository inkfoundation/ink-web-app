"use client";
import { Card, CardContent, InkIcon } from "@inkonchain/ink-kit";
import { useTranslations } from "next-intl";

import { FlyWhenIntoView } from "@/components/FlyWhenIntoView";
import { ParallaxedHoverImage } from "@/components/ParallaxedHoverImage";
import { newLayoutSectionClasses } from "@/components/styles/container";
import { EXTERNAL_LINKS, Link } from "@/routing";

import { PageHeader } from "../../_components/PageHeader";

export const Grants = () => {
  const t = useTranslations("Builders");

  return (
    <FlyWhenIntoView className={newLayoutSectionClasses()}>
      <div className="flex flex-col gap-6 items-start">
        <PageHeader
          title={t("grants.title")}
          description={t("grants.description")}
          size="section"
        />
      </div>
      <div className="grid lg:grid-cols-2 gap-6 self-center w-full">
        <Card
          className="w-full"
          variant="secondary"
          clickable
          asChild
          imageLocation="left"
          size="small"
          image={
            <CardContent.Image>
              <ParallaxedHoverImage
                src="/builders/grant.png"
                alt="A floating blob"
                width={100}
                height={100}
              />
            </CardContent.Image>
          }
        >
          <Link
            href={EXTERNAL_LINKS.grant}
            target="_blank"
            rel="noopener noreferrer"
          >
            <CardContent.Link
              title={t("applyForGrant.title")}
              description={t("applyForGrant.description")}
              linkIcon={<ExternalLinkArrow />}
            />
          </Link>
        </Card>
        <Card
          variant="secondary"
          clickable
          asChild
          imageLocation="left"
          size="small"
          image={
            <CardContent.Image>
              <ParallaxedHoverImage
                src="/builders/retro-grant.png"
                alt="A floating blob"
                width={100}
                height={100}
              />
            </CardContent.Image>
          }
        >
          <Link
            href={EXTERNAL_LINKS.retroGrant}
            target="_blank"
            rel="noopener noreferrer"
          >
            <CardContent.Link
              title={t("applyForRetroGrant.title")}
              description={t("applyForRetroGrant.description")}
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
