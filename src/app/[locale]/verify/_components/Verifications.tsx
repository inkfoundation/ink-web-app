"use client";

import React from "react";
import { InkIcon, Tag } from "@inkonchain/ink-kit";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useAccount } from "wagmi";

import { ColoredText } from "@/components/ColoredText";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";

type Perks = "Ink" | "Zora";
type Networks = "Ink" | "BASE" | "Arbitrum" | "Mode" | "Optimism";

interface Verification {
  icon: React.ReactNode;
  title: string;
  description: string;
  category: string;
  networks: Networks[];
  perks: Perks[];
}

const VERIFICATIONS: Verification[] = [
  {
    icon: <InkIcon.Swap />,
    title: "Uniswap Activity",
    description: "Verify volume, swap count, fees and more",
    category: "DeFi",
    networks: ["BASE", "Arbitrum", "Mode", "Optimism"],
    perks: ["Ink", "Zora"],
  },
];

const NETWORK_ICONS: Record<Networks, string> = {
  BASE: "/icons/BASE.svg",
  Arbitrum: "/icons/Arbitrum.svg",
  Mode: "/icons/Mode.svg",
  Optimism: "/icons/Optimism.svg",
  Ink: "/icons/Ink.svg",
};

const PERKS_ICONS: Record<Perks, string> = {
  Ink: "/icons/Ink.svg",
  Zora: "/icons/Zora.svg",
};

export const Verifications = () => {
  const t = useTranslations("Verify.verifications");

  return (
    <div className="flex flex-col gap-8 ">
      <div className="flex flex-col items-start gap-4">
        <ColoredText
          className="text-2xl sm:text-4xl font-medium"
          variant="purple"
          dampen="md"
        >
          {t("title")}
        </ColoredText>
        <div className="text-blackMagic/50 dark:text-whiteMagic/50 text-md">
          {t("description")}
        </div>
      </div>

      <DesktopVerificationsTable />
      <MobileVerificationsTable />
    </div>
  );
};

const DesktopVerificationsTable = () => {
  const { isConnected } = useAccount();
  return (
    <table className="w-full border-collapse ink:bg-background-container backdrop-blur-xl rounded-xl hidden lg:block">
      <thead>
        <tr className="text-right border-b border-blackMagic/10 dark:border-whiteMagic/10 ink:text-text-muted ink:text-body-3-bold">
          <th className="py-4 px-6 text-left">Verification</th>
          <th className="py-4 px-6">Category</th>
          <th className="py-4 px-6 text-left">Networks</th>
          <th className="py-4 px-6 text-left">Perks on</th>
          <th className="py-4 px-6">Status</th>
        </tr>
      </thead>
      <tbody className="ink:text-text-default">
        {VERIFICATIONS.map((verification) => (
          <tr
            key={verification.title}
            className="border-b border-blackMagic/10 dark:border-whiteMagic/10"
          >
            <td className="py-4 px-6 w-full">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-blackMagic/5 dark:bg-whiteMagic/5 p-3 shrink-0">
                  {verification.icon}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="ink:text-body-2-bold">
                    {verification.title}
                  </div>
                  <div className="ink:text-body-3-regular ink:text-text-muted">
                    {verification.description}
                  </div>
                </div>
              </div>
            </td>
            <td className="py-4 px-6">
              <div className="flex justify-end items-center gap-2">
                <Tag>{verification.category}</Tag>
              </div>
            </td>
            <td className="py-4 px-6">
              <div className="flex gap-1">
                {verification.networks
                  .filter((network) => network in NETWORK_ICONS)
                  .map((network) => (
                    <Image
                      key={network}
                      src={NETWORK_ICONS[network]}
                      alt={`an icon for ${network}`}
                      className="size-6 rounded-full -mr-3"
                      width={24}
                      height={24}
                    />
                  ))}
              </div>
            </td>
            <td className="py-4 px-6">
              <div className="flex gap-1">
                {verification.perks
                  .filter((perk) => perk in PERKS_ICONS)
                  .map((perk) => (
                    <Image
                      key={perk}
                      src={PERKS_ICONS[perk]}
                      alt={`an icon for ${perk}`}
                      className="size-6 rounded-full -mr-3"
                      width={24}
                      height={24}
                    />
                  ))}
              </div>
            </td>
            <td className="py-4 px-6">
              <div className="flex justify-end items-center gap-2">
                {isConnected ? (
                  <span
                    className="px-3 py-1 rounded-full ink:bg-background-container text-sm"
                    title="This is a placeholder"
                  >
                    Available
                  </span>
                ) : (
                  <ConnectWalletButton size="md" noIcon />
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const MobileVerificationsTable = () => {
  const { isConnected } = useAccount();
  return (
    <div className="w-full border-collapse ink:bg-background-container rounded-2xl lg:hidden">
      <div className="text-right border-b border-blackMagic/10 dark:border-whiteMagic/10 ink:text-text-muted ink:text-body-3-bold">
        <div className="py-4 px-6 text-left">Verification</div>
      </div>
      <div className="flex flex-col gap-4">
        {VERIFICATIONS.map((verification) => (
          <div key={verification.title} className="flex flex-col gap-6 p-4">
            <div className="flex justify-between gap-4 w-full">
              <div className="size-12 rounded-xl bg-blackMagic/5 dark:bg-whiteMagic/5 p-3 shrink-0">
                {verification.icon}
              </div>
              <div>
                <Tag>{verification.category}</Tag>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="ink:text-body-2-bold">{verification.title}</div>
              <div className="ink:text-body-3-regular ink:text-text-muted">
                {verification.description}
              </div>
            </div>
            <div className="flex gap-8">
              <div className="flex flex-col gap-2">
                <div className="ink:text-caption-1-bold">Networks</div>
                <div className="flex gap-1">
                  {verification.networks
                    .filter((network) => network in NETWORK_ICONS)
                    .map((network) => (
                      <Image
                        key={network}
                        src={NETWORK_ICONS[network]}
                        alt={`an icon for ${network}`}
                        className="size-6 rounded-full -mr-3"
                        width={24}
                        height={24}
                      />
                    ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="ink:text-caption-1-bold">Perks on</div>
                <div className="flex gap-1">
                  {verification.perks
                    .filter((perk) => perk in PERKS_ICONS)
                    .map((perk) => (
                      <Image
                        key={perk}
                        src={PERKS_ICONS[perk]}
                        alt={`an icon for ${perk}`}
                        className="size-6 rounded-full -mr-3"
                        width={24}
                        height={24}
                      />
                    ))}
                </div>
              </div>
            </div>
            <div className="flex justify-start items-center gap-2">
              {isConnected ? (
                <span
                  className="px-3 py-1 rounded-full ink:bg-background-container text-sm"
                  title="This is a placeholder"
                >
                  Available
                </span>
              ) : (
                <ConnectWalletButton size="md" noIcon />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
