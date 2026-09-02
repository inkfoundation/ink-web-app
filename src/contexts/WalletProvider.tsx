"use client";

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ToastContainer } from "react-toastify";
import {
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
import { useRelayChains } from "@reservoir0x/relay-kit-hooks";
import { MAINNET_RELAY_API } from "@reservoir0x/relay-sdk";
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
import { mainnet } from "wagmi/chains";

import { clientEnv } from "@/env-client";
import { useCurrentInkAppName } from "@/hooks/useCurrentInkAppName";

import "@reservoir0x/relay-kit-ui/styles.css";
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
  const [wagmiConfig, setWagmiConfig] = useState<
    ReturnType<typeof getDefaultConfig> | undefined
  >();
  const { chains, viemChains } = useRelayChains(MAINNET_RELAY_API);
  const { resolvedTheme } = useTheme();
  const appName = useCurrentInkAppName();

  useEffect(() => {
    if (!wagmiConfig && chains && viemChains) {
      const resolvedChains = (
        viemChains.length === 0 ? [mainnet] : viemChains
      ) as [Chain, ...Chain[]];
      setWagmiConfig(
        getDefaultConfig({
          appName: "inkonchain.com",
          appIcon: "https://inkonchain.com/icon.svg",
          appUrl: "https://inkonchain.com",
          projectId: clientEnv.NEXT_PUBLIC_WC_PROJECT_ID,
          chains: resolvedChains,
          transports: buildTransports(resolvedChains),
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
        })
      );
    }
  }, [wagmiConfig, chains, viemChains]);

  if (!wagmiConfig || !chains) {
    return null;
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <RainbowKitProvider
        appInfo={{
          appName,
        }}
        theme={resolvedTheme === "dark" ? darkTheme() : lightTheme()}
      >
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
