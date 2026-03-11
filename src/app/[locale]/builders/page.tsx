import { useTranslations } from "next-intl";

import { OnlyWithFeatureFlag } from "@/components/OnlyWithFeatureFlag";
import { newLayoutContainerClasses } from "@/components/styles/container";

import { PageHeader } from "../_components/PageHeader";

import { Grants } from "./_components/Grants";
import { WriteYourCodeWithInk } from "./_components/WriteYourCodeWithInk";

export default function BuildersPage() {
  const t = useTranslations("Builders");
  return (
    <div className={newLayoutContainerClasses()}>
      <PageHeader title={t("title")} description={t("description")} />
      <WriteYourCodeWithInk />
      <OnlyWithFeatureFlag flag="grantsSection">
        <Grants />
      </OnlyWithFeatureFlag>
    </div>
  );
}
