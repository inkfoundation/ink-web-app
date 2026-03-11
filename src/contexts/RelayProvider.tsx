"use client";

import { ReactNode } from "react";
import { useRelayChains } from "@reservoir0x/relay-kit-hooks";
import { RelayKitProvider } from "@reservoir0x/relay-kit-ui";
import { MAINNET_RELAY_API } from "@reservoir0x/relay-sdk";

import { useCurrentInkAppName } from "@/hooks/useCurrentInkAppName";
import { theme } from "@/util/relay-kit-theme";

import "@reservoir0x/relay-kit-ui/styles.css";

interface RelayProviderProps {
  children: ReactNode;
}

export const RelayProvider: React.FC<RelayProviderProps> = ({ children }) => {
  const { chains } = useRelayChains(MAINNET_RELAY_API);
  const appName = useCurrentInkAppName();

  return (
    <RelayKitProvider
      theme={theme}
      options={{
        appName: appName,
        appFees: [],
        chains: chains,
        baseApiUrl: MAINNET_RELAY_API,
        duneConfig: {
          apiBaseUrl: `${window.location.origin}/api/dune`,
          apiKey: "",
        },
      }}
    >
      {children}
    </RelayKitProvider>
  );
};

RelayProvider.displayName = "RelayProvider";
