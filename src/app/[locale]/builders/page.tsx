import { Button } from "@inkonchain/ink-kit";
import { useTranslations } from "next-intl";

import { newLayoutContainerClasses } from "@/components/styles/container";

import { PageHeader } from "../_components/PageHeader";

import { BuilderBenefits } from "./_components/BuilderBenefits";
import { BuilderPrograms } from "./_components/BuilderPrograms";
import { HowItWorks } from "./_components/HowItWorks";
import { OurFocus } from "./_components/OurFocus";
import { ReadyToInk } from "./_components/ReadyToInk";
import { StartInking } from "./_components/StartInking";

export default function BuildersPage() {
  const t = useTranslations("Builders");
  return (
    <div className={newLayoutContainerClasses()}>
      <div className="max-w-xl bg-background rounded-2xl p-6 -m-6">
        <PageHeader
          title={t("title")}
          description={t("subtitle")}
          cta={
            <Button asChild size="lg" variant="primary">
              <a href="#our-focus">
                {t("cta")} <span aria-hidden>&#8595;</span>
              </a>
            </Button>
          }
        />
      </div>
      <ReadyToInk />
      <div id="our-focus">
        <OurFocus />
      </div>
      <BuilderPrograms />
      <HowItWorks />
      <BuilderBenefits />
      <StartInking />
    </div>
  );
}
