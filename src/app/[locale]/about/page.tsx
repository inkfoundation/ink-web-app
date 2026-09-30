import { Metadata } from "next";
import { useTranslations } from "next-intl";

import { newLayoutContainerClasses } from "@/components/styles/container";

import { PageHeader } from "../_components/PageHeader";

import { DefiExpectations } from "./_components/DefiExpectations";
import { InkTheFuture } from "./_components/InkTheFuture";
import { PartnerCards } from "./_components/PartnerCards";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://inkonchain.com/about",
  },
  title: "What is Ink?",
  description:
    "Ink is an Ethereum layer 2 blockchain, built on the OP Stack, designed to be the house of DeFi for the Superchain. Ink will empower onchain builders to deploy new and innovative DeFi protocols for the next billion users onchain.",
};

export default function AboutPage() {
  const t = useTranslations("About");
  return (
    <div className={newLayoutContainerClasses()}>
      <PageHeader title={t("title")} description={t("description")} />
      <InkTheFuture />
      <DefiExpectations />
      <PartnerCards />
    </div>
  );
}
