"use client";

import React, { Suspense } from "react";
import { Button, InkIcon, Tag } from "@inkonchain/ink-kit";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useAccount } from "wagmi";

import { ColoredText } from "@/components/ColoredText";

import { useVerificationFlow } from "../_hooks/useVerificationFlow";

type Networks = "Ink" | "Mode" | "Optimism" | "Ethereum";

type VerificationStatus = "verify" | "verified" | "coming_soon";

type VerificationId = "kraken";

interface Verification {
  id: VerificationId;
  icon: React.ReactNode;
  title: string;
  description: string;
  category: string;
  networks: Networks[];
  status: VerificationStatus;
}

interface VerificationAction {
  onClick?: () => void;
  isLoading?: boolean;
  isCheckingStatus?: boolean;
}

const VERIFICATIONS: Verification[] = [
  {
    id: "kraken",
    icon: <InkIcon.VerifiedIcon />,
    title: "Kraken Verify",
    description: "Kraken verifications schema for an account",
    category: "Kraken",
    networks: ["Ethereum", "Ink", "Optimism", "Mode"],
    status: "verify",
  },
];

const NETWORK_ICONS: Record<Networks, string> = {
  Mode: "/icons/Mode.svg",
  Optimism: "/icons/Optimism.svg",
  Ink: "/icons/Ink.svg",
  Ethereum: "/icons/ethereum.svg",
};

export const Verifications = () => {
  return (
    <Suspense>
      <VerificationsInner />
    </Suspense>
  );
};

const VerificationsInner = () => {
  const t = useTranslations("Verify.verifications");
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const {
    isCheckingVerification,
    isVerified,
    isConfirming,
    handleInitVerification,
    initVerification,
    completeVerification,
    hasSuccessfullySignedInToKraken,
  } = useVerificationFlow(address);

  const isVerifyInProgress =
    isConfirming ||
    initVerification.isPending ||
    initVerification.isSuccess ||
    hasSuccessfullySignedInToKraken ||
    completeVerification.isPending;

  // Compute dynamic verifications with real-time Kraken status
  const verifications = VERIFICATIONS.map((v) => {
    if (v.id === "kraken" && isVerified) {
      return { ...v, status: "verified" as VerificationStatus };
    }
    return v;
  });

  // Build action map for each verification
  const actions: Record<VerificationId, VerificationAction> = {
    kraken: {
      onClick: () => {
        if (!isConnected) {
          openConnectModal?.();
        } else {
          handleInitVerification();
        }
      },
      isLoading: isVerifyInProgress,
      isCheckingStatus: isConnected && isCheckingVerification,
    },
  };

  return (
    <div className="flex flex-col gap-8">
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

      <DesktopVerificationsTable
        verifications={verifications}
        actions={actions}
      />
      <MobileVerificationsTable
        verifications={verifications}
        actions={actions}
      />
    </div>
  );
};

const StatusBadge = ({
  status,
  onClick,
  isLoading,
  isCheckingStatus,
}: {
  status: VerificationStatus;
  onClick?: () => void;
  isLoading?: boolean;
  isCheckingStatus?: boolean;
}) => {
  if (isCheckingStatus) {
    return (
      <div className="h-10 w-28 animate-pulse rounded-full bg-inkPurple/15" />
    );
  }
  if (status === "verified") {
    return (
      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-inkSuccess/10 text-inkSuccess ink:text-body-3-bold">
        <InkIcon.Check className="size-4" />
        Verified
      </span>
    );
  }
  if (status === "coming_soon") {
    return (
      <Button size="md" variant="secondary" disabled>
        Coming Soon
      </Button>
    );
  }
  return (
    <Button size="md" variant="primary" onClick={onClick} disabled={isLoading}>
      {isLoading ? (
        <span className="flex items-center gap-2">
          Verifying
          <InkIcon.Loading className="size-4 animate-spin" />
        </span>
      ) : (
        "Verify"
      )}
    </Button>
  );
};

const DesktopVerificationsTable = ({
  verifications,
  actions,
}: {
  verifications: Verification[];
  actions: Record<VerificationId, VerificationAction>;
}) => {
  return (
    <table className="w-full border-collapse ink:bg-background-container rounded-xl hidden lg:block">
      <thead>
        <tr className="text-right border-b border-[var(--ink-background-dark)] ink:text-text-muted ink:text-body-3-bold">
          <th className="py-4 px-6 text-left">Verification</th>
          <th className="py-4 px-6">Category</th>
          <th className="py-4 px-6 text-left">Networks</th>
          <th className="py-4 px-6">Status</th>
        </tr>
      </thead>
      <tbody className="ink:text-text-default">
        {verifications.map((verification) => {
          const action = actions[verification.id];
          return (
            <tr
              key={verification.id}
              className="border-b border-[var(--ink-background-dark)] last:border-b-0"
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
                <div className="flex justify-end items-center gap-2">
                  <StatusBadge
                    status={verification.status}
                    onClick={action.onClick}
                    isLoading={action.isLoading}
                    isCheckingStatus={action.isCheckingStatus}
                  />
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const MobileVerificationsTable = ({
  verifications,
  actions,
}: {
  verifications: Verification[];
  actions: Record<VerificationId, VerificationAction>;
}) => {
  return (
    <div className="w-full border-collapse ink:bg-background-container rounded-2xl lg:hidden">
      <div className="text-right border-b border-[var(--ink-background-dark)] ink:text-text-muted ink:text-body-3-bold">
        <div className="py-4 px-6 text-left">Verification</div>
      </div>
      <div className="flex flex-col gap-4">
        {verifications.map((verification) => {
          const action = actions[verification.id];
          return (
            <div key={verification.id} className="flex flex-col gap-6 p-4">
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
              <div className="flex justify-start items-center gap-2">
                <StatusBadge
                  status={verification.status}
                  onClick={action.onClick}
                  isLoading={action.isLoading}
                  isCheckingStatus={action.isCheckingStatus}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
