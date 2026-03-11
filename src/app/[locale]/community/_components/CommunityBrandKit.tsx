"use client";
import { Button, Card, CardContent } from "@inkonchain/ink-kit";
import { useTranslations } from "next-intl";

import { ColoredText } from "@/components/ColoredText";
import { FlyWhenIntoView } from "@/components/FlyWhenIntoView";
import { ParallaxedHoverImage } from "@/components/ParallaxedHoverImage";
import { EXTERNAL_LINKS, Link } from "@/routing";

export const CommunityBrandKit = () => {
  const t = useTranslations("Community");

  return (
    <FlyWhenIntoView>
      <Card
        size="noPadding"
        imageLocation="right"
        image={
          <CardContent.Image>
            <ParallaxedHoverImage
              src="/brand-kit.png"
              alt="Brand Kit"
              className="object-cover"
              width={700}
              height={395}
            />
          </CardContent.Image>
        }
      >
        <CardContent.CallToAction
          title={
            <ColoredText className="ink:text-h2" variant="purple">
              {t("brandKit.title")}
            </ColoredText>
          }
          description={t("brandKit.description")}
          button={
            <Button variant="primary" size="md" asChild>
              <Link
                href={EXTERNAL_LINKS.brandKit}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("brandKit.cta")}
              </Link>
            </Button>
          }
        />
      </Card>
    </FlyWhenIntoView>
  );
};
