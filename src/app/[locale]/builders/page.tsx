import { Metadata } from "next";

import { PageView } from "@/components/PageView";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://inkonchain.com/builders",
  },
  title: "Start building on Ink",
  description:
    "Our commitment to builders: Ink will provide you with a world class development environment, complete with the tools, support, and users you need to bring your ideas to life.",
};

export default function BuildersPage() {
  return <PageView />;
}
