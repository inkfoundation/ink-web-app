"use client";

import React, { createContext, ReactNode, useContext, useMemo } from "react";
import { ToastContainer } from "react-toastify";
import {
  cssStringFromTheme,
  darkTheme,
  getDefaultConfig,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  krakenWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { useTheme } from "next-themes";
import { Chain } from "viem";
import {
  cookieStorage,
  createStorage,
  fallback,
  http,
  useAccount,
  useSwitchChain,
  WagmiProvider,
} from "wagmi";
import { ink, inkSepolia, mainnet, sepolia } from "wagmi/chains";

import { clientEnv } from "@/env-client";
import { useCurrentInkAppName } from "@/hooks/useCurrentInkAppName";

import "@rainbow-me/rainbowkit/styles.css";
import "react-toastify/dist/ReactToastify.css";

const CloseButton = ({
  closeToast,
}: {
  closeToast: (e: React.MouseEvent<HTMLElement>) => void;
}) => (
  <i
    className="dark:text-white text-black cursor-pointer not-italic mx-0.5"
    onClick={closeToast}
  >
    ✕
  </i>
);

interface WalletProviderProps {
  children: ReactNode;
}

interface WalletContextType {
  address?: `0x${string}`;
  isConnected?: boolean;
  chainId?: number;
  switchChain?: ReturnType<typeof useSwitchChain>["switchChain"];
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

/**
 * Explicit RPC endpoints for Ethereum mainnet. Without these, wagmi falls back
 * to viem's built-in default (currently https://eth.merkle.io), which has been
 * unreliable / CORS-blocked in production. `fallback` tries each in order.
 */
const mainnetTransport = fallback([
  http("https://ethereum-rpc.publicnode.com"),
  http("https://eth.drpc.org"),
  http("https://cloudflare-eth.com"),
  // Last resort: viem's built-in default RPC for the chain.
  http(),
]);

function buildTransports(chains: readonly Chain[]) {
  return Object.fromEntries(
    chains.map((chain) => [
      chain.id,
      chain.id === mainnet.id ? mainnetTransport : http(),
    ])
  );
}

/**
 * Every chain the app touches on-chain: Ethereum mainnet (ENS + bridging
 * entry), Ink, and the two testnets used by the faucet and testnet bridge.
 *
 * This used to be fetched from the Relay API at runtime, which blocked the
 * first render of the entire app (and all server rendering) on a third-party
 * network call. The Relay swap widget that needed the full chain list has
 * been removed; if it returns, extend this list or reintroduce the dynamic
 * config alongside it rather than gating the whole tree.
 */
const chains = [mainnet, ink, inkSepolia, sepolia] as const;

/**
 * Created once at module scope, as recommended by wagmi for SSR setups
 * (`ssr: true` + cookie storage keep server and client hydration in sync).
 */
const wagmiConfig = getDefaultConfig({
  appName: "inkonchain.com",
  appIcon: "https://inkonchain.com/icon.svg",
  appUrl: "https://inkonchain.com",
  projectId: clientEnv.NEXT_PUBLIC_WC_PROJECT_ID,
  chains,
  transports: buildTransports(chains),
  wallets: [
    {
      groupName: "Recommended",
      wallets: [
        krakenWallet,
        rainbowWallet,
        walletConnectWallet,
        injectedWallet,
      ],
    },
  ],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

const WagmiComponent: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { address, chain, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();

  const walletContextValue = useMemo(
    () => ({
      address,
      isConnected,
      chainId: chain?.id,
      switchChain,
    }),
    [address, isConnected, chain, switchChain]
  );

  return (
    <WalletContext.Provider value={walletContextValue}>
      {children}
    </WalletContext.Provider>
  );
};

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const { resolvedTheme } = useTheme();
  const appName = useCurrentInkAppName();

  return (
    <WagmiProvider config={wagmiConfig}>
      <RainbowKitProvider
        appInfo={{
          appName,
        }}
        theme={null}
      >
        {/* RainbowKit's theme prop bakes the palette into an inline style
            tag, but the resolved theme is unknown during server rendering,
            which caused hydration mismatches. Rendering both palettes keyed
            off next-themes' `dark` class is deterministic on both sides.
            https://rainbowkit.com/docs/theming#custom-theme-selectors */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root { ${cssStringFromTheme(lightTheme())} }
              html.dark { ${cssStringFromTheme(darkTheme(), { extends: lightTheme() })} }
            `,
          }}
        />
        <WagmiComponent>{children}</WagmiComponent>
        <ToastContainer
          className="font-extrabold"
          position="bottom-center"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick={true}
          pauseOnHover={true}
          draggable={true}
          theme={resolvedTheme}
          closeButton={CloseButton}
          style={{
            textAlign: "center",
            fontSize: "16px",
            lineHeight: "1.5",
          }}
        />
      </RainbowKitProvider>
    </WagmiProvider>
  );
};
