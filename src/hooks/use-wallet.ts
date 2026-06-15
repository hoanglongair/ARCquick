"use client";

import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain, useBalance } from "wagmi";
import { useCallback } from "react";
import { arcSepolia, arcTestnet, isArcChain, isArcTestnet } from "@/lib/wagmi/index";

const ARC_CHAIN_IDS = [arcSepolia.id, arcTestnet.id] as const;

export function useWallet() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  // Get native balance on current chain
  const { data: ethBalance } = useBalance({
    address,
  });

  const isOnArcNetwork = isArcChain(chainId);
  const onArcTestnet = isArcTestnet(chainId);

  const switchToArc = useCallback(async () => {
    if (switchChain && !isOnArcNetwork) {
      try {
        switchChain({ chainId: arcSepolia.id });
      } catch (error) {
        console.error("Failed to switch to Arc network:", error);
      }
    }
  }, [switchChain, isOnArcNetwork]);

  const switchToArcTestnet = useCallback(async () => {
    if (switchChain) {
      try {
        switchChain({ chainId: arcTestnet.id });
      } catch (error) {
        console.error("Failed to switch to Arc Testnet:", error);
      }
    }
  }, [switchChain]);

  const connectWallet = useCallback(
    (connectorId?: string) => {
      const connector = connectors.find((c) => c.uid === connectorId) || connectors[0];
      if (connector) {
        connect({ connector });
      }
    },
    [connect, connectors]
  );

  const disconnectWallet = useCallback(() => {
    disconnect();
  }, [disconnect]);

  return {
    // Account state
    address,
    isConnected,
    isConnecting,

    // Chain state
    chainId,
    isOnArcNetwork,
    onArcTestnet,
    currentChain: chainId,

    // Balance
    ethBalance,

    // Actions
    connect: connectWallet,
    disconnect: disconnectWallet,
    switchToArc,
    switchToArcTestnet,

    // Connectors
    connectors,
    isPending,
    isSwitching,

  };
}
