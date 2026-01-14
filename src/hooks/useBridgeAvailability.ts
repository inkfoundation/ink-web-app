"use client";

import { useMemo } from "react";
import { useQuote } from "@reservoir0x/relay-kit-hooks";
import { useRelayClient } from "@reservoir0x/relay-kit-ui";
import { useAccount } from "wagmi";

/**
 * Hook to check if the bridge route from Ethereum to Ink is available.
 * Returns true if the bridge is working, false if disabled/unavailable.
 */
export function useBridgeAvailability() {
  const { address } = useAccount();
  const relayClient = useRelayClient();

  // Use a dummy address if no wallet is connected, just to check route availability
  const checkAddress: `0x${string}` =
    (address as `0x${string}`) || "0x0000000000000000000000000000000000000000";

  // Check route availability with a small test amount (0.001 ETH in wei)
  const testAmount = "1000000000000000"; // 0.001 ETH

  const {
    data: quote,
    error,
    isLoading,
  } = useQuote(
    relayClient || undefined,
    undefined, // No wallet needed just to check availability
    {
      user: checkAddress,
      originChainId: 1, // Ethereum Mainnet
      destinationChainId: 57073, // Ink Mainnet
      originCurrency: "0x0000000000000000000000000000000000000000" as `0x${string}`, // ETH
      destinationCurrency: "0x0000000000000000000000000000000000000000" as `0x${string}`, // ETH
      amount: testAmount,
      tradeType: "EXACT_INPUT" as const,
    },
    undefined, // onRequest
    undefined, // onResponse
    {
      enabled: !!relayClient, // Only run query if client is available
    }
  );

  // Bridge is available if we get a quote without errors
  // If there's an error (especially "Chain Disabled"), it's not available
  const isAvailable = useMemo(() => {
    if (isLoading) {
      // While loading, assume available (optimistic) to avoid flickering
      return true;
    }

    if (error) {
      // Check if error indicates chain is disabled
      const errorMessage = String(error?.message || error || "").toLowerCase();
      if (
        errorMessage.includes("chain disabled") ||
        errorMessage.includes("route not available") ||
        errorMessage.includes("unsupported") ||
        errorMessage.includes("chain is disabled") ||
        errorMessage.includes("not available")
      ) {
        return false;
      }
      // Other errors might be transient, so we'll be optimistic
      return true;
    }

    // If we have a quote, the route is available
    return !!quote;
  }, [quote, error, isLoading]);

  return {
    isAvailable,
    isLoading,
    error: error ? String(error?.message || error || "") : null,
  };
}
