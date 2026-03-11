"use client";
import { Button, InkIcon } from "@inkonchain/ink-kit";
import { useTranslations } from "next-intl";

import { ColoredText } from "@/components/ColoredText";
import { newLayoutSectionClasses } from "@/components/styles/container";
import { useRouterQuery } from "@/hooks/useRouterQuery";
import { Link } from "@/routing";

import { HomeNado } from "./HomeNado";
import { HomeTydro } from "./HomeTydro";

export const HomeFeatured = () => {
  const t = useTranslations("Home");
  const query = useRouterQuery();
  return (
    <div className={newLayoutSectionClasses()}>
      <div className="flex justify-between items-center">
        <h2 className="ink:text-h4">
          Featuring{" "}
          <ColoredText variant="purple" noAnimation>
            INK airdrop
          </ColoredText>
        </h2>
        <Button
          asChild
          variant="secondary"
          iconRight={<InkIcon.Arrow className="rotate-270" />}
        >
          <Link href={{ pathname: "/apps", query }}>{t("appsCta")}</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HomeTydro />
        <HomeNado />
      </div>
    </div>
  );
};
