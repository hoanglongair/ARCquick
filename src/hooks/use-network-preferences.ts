"use client";

import { useMemo } from "react";
import { useAccount } from "wagmi";
import { getChainFeatures, getAvailableFeatures } from "@/lib/network/chain-features";
import type { Token } from "@/types";

export interface NetworkPreferences {
  preferredChainId: number | null;
  showTestnets: boolean;
  supportedTokens: Token[];
  availableFeatures: ReturnType<typeof getAvailableFeatures>;
}

export function useNetworkPreferences() {
  const { chain } = useAccount();
  const chainId = chain?.id ?? 421614;

  const preferences = useMemo<NetworkPreferences>(() => {
    const features = getChainFeatures(chainId);
    const available = getAvailableFeatures(chainId);

    return {
      preferredChainId: chainId,
      showTestnets: true,
      supportedTokens: features?.tokens.map((sym) => ({
        symbol: sym,
        address: sym === "ETH" ? "0x0000000000000000000000000000000000000000" : "",
        decimals: sym === "ETH" ? 18 : 6,
        name: sym,
        icon: sym === "ETH" ? "\u039E" : "$",
        chainId,
        price: 1,
      })) ?? [],
      availableFeatures: available,
    };
  }, [chainId]);

  return preferences;
}
