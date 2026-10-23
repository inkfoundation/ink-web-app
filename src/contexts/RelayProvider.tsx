"use client";

import { ReactNode } from "react";
import { useRelayChains } from "@relayprotocol/relay-kit-hooks";
import { RelayKitProvider } from "@relayprotocol/relay-kit-ui";
import { MAINNET_RELAY_API } from "@relayprotocol/relay-sdk";

import { relayBoardTheme } from "@/app/[locale]/_components/HomeBoard/relay-board";
import { useCurrentInkAppName } from "@/hooks/useCurrentInkAppName";

import "@relayprotocol/relay-kit-ui/styles.css";

/**
 * All Relay traffic goes through our own /api/relay proxy, which attaches
 * the foundation API key server-side (see src/app/api/relay/[...path]/route.ts).
 * The relay kit requires an absolute URL (it calls `new URL(...)` on it), so
 * we build one from the current origin. During SSR no requests are made, the
 * fallback only keeps the initial render happy.
 */
const RELAY_PROXY_URL =
  typeof window === "undefined"
    ? MAINNET_RELAY_API
    : `${window.location.origin}/api/relay`;

interface RelayProviderProps {
  children: ReactNode;
}

export const RelayProvider: React.FC<RelayProviderProps> = ({ children }) => {
  const { chains } = useRelayChains(RELAY_PROXY_URL);
  const appName = useCurrentInkAppName();

  return (
    <RelayKitProvider
      theme={relayBoardTheme}
      options={{
        appName: appName,
        appFees: [],
        chains: chains,
        baseApiUrl: RELAY_PROXY_URL,
      }}
    >
      {children}
    </RelayKitProvider>
  );
};

RelayProvider.displayName = "RelayProvider";
