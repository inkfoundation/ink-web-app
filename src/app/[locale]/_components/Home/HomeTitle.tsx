"use client";
import { useMemo } from "react";
import { Button, InkIcon } from "@inkonchain/ink-kit";
import { useTranslations } from "next-intl";

import { ColoredText } from "@/components/ColoredText";
import { RotatingText } from "@/components/RotatingText";
import { useRouterQuery } from "@/hooks/useRouterQuery";
import { Link } from "@/routing";

import { PageHeader } from "../PageHeader";

export const HomeTitle = () => {
  const t = useTranslations("Home");
  const query = useRouterQuery();
  return (
    <>
      <PageHeader
        title="Ink the future"
        description={<TagLineWithHighlight text={t("tagLine")} />}
        cta={
          <Button
            variant="primary"
            size="lg"
            iconRight={<InkIcon.Arrow className="rotate-270" />}
            asChild
          >
            <Link href={{ pathname: "/apps", query }} prefetch>
              {t("cta:exploreApps")}
            </Link>
          </Button>
        }
        size="home"
      />
    </>
  );
};

const TagLineWithHighlight: React.FC<{
  text?: string;
  disableRotating?: boolean;
}> = ({ text }) => {
  const [first, second] = useMemo(() => text?.split("|") || [], [text]);
  const allSections = useMemo(() => {
    const sections = second?.split(",") || [];
    return sections.map((s, i) => {
      return i === sections.length - 1 ? (
        <ColoredText key={s} variant="reverse-purple">
          {s}
        </ColoredText>
      ) : (
        <span key={s}>{s}</span>
      );
    });
  }, [second]);
  return (
    <div className="flex items-baseline ink:text-h3 flex-wrap justify-start ink:text-button-primary">
      {/** Height should match the height of the PillContainer+Rotating text for the text to be aligned. */}
      <ColoredText
        className="whitespace-normal flex justify-center mr-2"
        variant="ink"
        noAnimation
      >
        {first}
      </ColoredText>
      <RotatingText sections={allSections} />
    </div>
  );
};
