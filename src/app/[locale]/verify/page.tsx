import { Button } from "@inkonchain/ink-kit";
import { useTranslations } from "next-intl";

import { OnlyWithFeatureFlag } from "@/components/OnlyWithFeatureFlag";
import { newLayoutContainerClasses } from "@/components/styles/container";

import { PageHeader } from "../_components/PageHeader";

import { Verifications } from "./_components/Verifications";
import { VerifyInfoCards } from "./_components/VerifyInfoCards";
import { VerifyLearnMore } from "./_components/VerifyLearnMore";

export default function VerifyPage() {
  const t = useTranslations("Verify");
  return (
    <OnlyWithFeatureFlag flag="verifyPage">
      <div className={newLayoutContainerClasses()}>
        <div className="max-w-xl">
          <PageHeader
            title={t("title")}
            description={t("description")}
            cta={
              <Button asChild size="lg" variant="primary">
                <a href="#verifications">{t("cta")}</a>
              </Button>
            }
          />
        </div>
        <VerifyInfoCards />
        <div id="verifications">
          <Verifications />
        </div>
        <VerifyLearnMore />
      </div>
    </OnlyWithFeatureFlag>
  );
}
