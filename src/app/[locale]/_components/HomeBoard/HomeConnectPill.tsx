"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";

interface HomeConnectPillProps {
  className?: string;
  label: string;
}

export function HomeConnectPill({
  className = "pill pill--purple",
  label,
}: HomeConnectPillProps) {
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
        const connected = mounted && account && chain;
        const onClick = !connected
          ? openConnectModal
          : chain.unsupported
            ? openChainModal
            : openAccountModal;

        return (
          <button
            className={className}
            type="button"
            data-w="connect"
            onClick={onClick}
          >
            {connected && account ? account.displayName : label}
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}
