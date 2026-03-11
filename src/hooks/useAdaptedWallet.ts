import { useEffect, useState } from "react";
import { adaptViemWallet } from "@reservoir0x/relay-sdk";
import { useAccount, useWalletClient } from "wagmi";

export const useAdaptedWallet = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [adaptedWallet, setAdaptedWallet] = useState<any>();

  useEffect(() => {
    if (!address) {
      // User logged out, clear the adapted wallet
      setAdaptedWallet(undefined);
      return;
    }

    if (!walletClient?.account?.address) {
      // User logged in but wallet client address undefined, possibly doing a chain switch, keep the last valid wallet
      return;
    }

    // User logged in and wallet client address is defined, adapt the wallet
    setAdaptedWallet(adaptViemWallet(walletClient));
  }, [address, walletClient]);

  return adaptedWallet;
};
