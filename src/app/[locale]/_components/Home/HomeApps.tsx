"use client";
import { Button } from "@inkonchain/ink-kit";
import { useTranslations } from "next-intl";

import { ColoredText } from "@/components/ColoredText";
import { newLayoutSectionClasses } from "@/components/styles/container";
import { useRouterQuery } from "@/hooks/useRouterQuery";
import { Link } from "@/routing";

import { AppsGrid } from "../../apps/_components/AppsGrid";
import { inkHomeApps } from "../../apps/_components/InkApp";

export const HomeApps = () => {
  const t = useTranslations("Home");
  const query = useRouterQuery();
  return (
    <div className={newLayoutSectionClasses()}>
      <div className="flex justify-between">
        <ColoredText className="ink:text-h4" variant="purple">
          {t("appsTitle")}
        </ColoredText>
        <Button asChild variant="secondary">
          <Link href={{ pathname: "/apps", query }}>{t("appsCta")}</Link>
        </Button>
      </div>
      <AppsGrid
        apps={inkHomeApps}
        featuredApps={[]}
        noAppsFound={null}
        network="Mainnet"
      />
    </div>
  );
};
