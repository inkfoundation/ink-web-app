import { Metadata } from "next";
import { useTranslations } from "next-intl";

import { newLayoutContainerClasses } from "@/components/styles/container";

import { PageHeader } from "../_components/PageHeader";

import { CommunityBrandKit } from "./_components/CommunityBrandKit";
import { CommunityEvents } from "./_components/CommunityEvents";
import { LetsGetSocial } from "./_components/LetsGetSocial";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://inkonchain.com/community",
  },
  title: "Join the Ink Community",
  description:
    "Discover, dive into events, and get the support you need to ink the future with us",
};

export default function CommunityPage() {
  const t = useTranslations("Community");
  return (
    <>
      <div className={newLayoutContainerClasses()}>
        <PageHeader title={t("title")} description={t("description")} />

        <CommunityEvents />
        <LetsGetSocial />
        <CommunityBrandKit />
      </div>
    </>
  );
}
