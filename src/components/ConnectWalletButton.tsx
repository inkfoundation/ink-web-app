"use client";

import { Button, ButtonProps, InkIcon } from "@inkonchain/ink-kit";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";

import { classNames } from "@/util/classes";
import { truncateEnsName } from "@/util/formatWallet";

interface ConnectWalletButtonProps {
  className?: string;
  connectLabel?: string;
  shrinkOnMobile?: boolean;
  noIcon?: boolean;
  size?: "md" | "lg";
  variant?: ButtonProps["variant"];
  /** Renders the connected state as a hardcoded dark pill (not theme-affected). */
  walletPill?: boolean;
}

export const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({
  className,
  connectLabel = "Connect",
  shrinkOnMobile = false,
  size = "md",
  noIcon = false,
  variant = "transparent",
  walletPill = false,
}) => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {!connected ? (
              <Button
                onClick={openConnectModal}
                type="button"
                className={classNames(className)}
                size={size}
                variant={variant}
              >
                {!noIcon && (
                  <div className={shrinkOnMobile ? "sm:hidden" : ""}>
                    <InkIcon.Wallet className="size-6" enforce="inherit" />
                  </div>
                )}
                <div className={shrinkOnMobile ? "hidden sm:block" : ""}>
                  {connectLabel}
                </div>
              </Button>
            ) : walletPill ? (
              <>
                {/* Mobile: avatar-only pill */}
                <button
                  onClick={
                    chain.unsupported ? openChainModal : openAccountModal
                  }
                  className={classNames(
                    "flex items-center justify-center rounded-full h-10 w-10 bg-[#191919] cursor-pointer",
                    shrinkOnMobile ? "sm:hidden" : "hidden"
                  )}
                >
                  <Image
                    src={account.ensAvatar || "/icons/profile-avatar.png"}
                    alt="Profile"
                    className="size-8 rounded-full"
                    height={32}
                    width={32}
                  />
                </button>
                {/* Desktop: avatar + name pill */}
                <button
                  onClick={
                    chain.unsupported ? openChainModal : openAccountModal
                  }
                  className={classNames(
                    "flex items-center gap-2 rounded-full h-10 py-2 pr-4 pl-1 bg-[#191919] text-white cursor-pointer whitespace-nowrap text-sm font-medium",
                    shrinkOnMobile ? "hidden sm:flex" : ""
                  )}
                >
                  <Image
                    src={account.ensAvatar || "/icons/profile-avatar.png"}
                    alt="Profile"
                    className="size-8 rounded-full"
                    height={32}
                    width={32}
                  />
                  {account.ensName
                    ? truncateEnsName(account.ensName)
                    : account.displayName}
                </button>
              </>
            ) : (
              <>
                <Button
                  onClick={
                    chain.unsupported ? openChainModal : openAccountModal
                  }
                  className={classNames(
                    chain.unsupported &&
                      "ink:text-status-error ink:bg-status-error-bg",
                    shrinkOnMobile ? "sm:hidden" : "hidden",
                    className
                  )}
                  size={size}
                  variant={variant}
                  rounded="full"
                >
                  <Image
                    src={account.ensAvatar || "/icons/profile-avatar.png"}
                    alt="Profile"
                    className="size-6 rounded-full"
                    height={39}
                    width={39}
                  />
                </Button>
                <Button
                  onClick={
                    chain.unsupported ? openChainModal : openAccountModal
                  }
                  className={classNames(
                    chain.unsupported &&
                      "ink:text-status-error ink:bg-status-error-bg",
                    shrinkOnMobile ? "hidden sm:block" : "",
                    className
                  )}
                  size={size}
                  variant={variant}
                >
                  <div className="ink:-my-1 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Image
                        src={account.ensAvatar || "/icons/profile-avatar.png"}
                        alt="Profile"
                        className="w-6 h-6 rounded-full"
                        height={39}
                        width={39}
                      />
                      {account.ensName
                        ? truncateEnsName(account.ensName)
                        : account.displayName}
                    </div>
                  </div>
                </Button>
              </>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
