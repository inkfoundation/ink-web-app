import { useTranslations } from "next-intl";

import { KrakenLogo } from "@/components/icons/KrakenLogo";
import { OnlyWithFeatureFlag } from "@/components/OnlyWithFeatureFlag";
import { newLayoutContainerClasses } from "@/components/styles/container";

import { PageHeader } from "../_components/PageHeader";

import { VerifyCta } from "./_components/VerifyCta";
import { VerifyLearnMore } from "./_components/VerifyLearnMore";
import { VerifyPerks } from "./_components/VerifyPerks";

export default function VerifyPage() {
  const t = useTranslations("Verify");
  return (
    <OnlyWithFeatureFlag flag="verifyPage">
      <div className={newLayoutContainerClasses()}>
        <div className="space-y-6">
          <KrakenLogo />
          <PageHeader
            title={t("title")}
            description={t("description")}
            cta={<VerifyCta />}
          />
        </div>
        <VerifyPerks />
        <VerifyLearnMore />
      </div>
    </OnlyWithFeatureFlag>
  );
}
