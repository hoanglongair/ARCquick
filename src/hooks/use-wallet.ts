"use client";

import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain, useBalance } from "wagmi";
import { useCallback } from "react";
import { arcTestnet } from "@/lib/wagmi/config";

export function useWallet() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  // Get ETH balance on current chain
  const { data: ethBalance } = useBalance({
    address,
  });

  const isOnArcNetwork = chainId === arcTestnet.id;

  const switchToArc = useCallback(async () => {
    if (switchChain && !isOnArcNetwork) {
      try {
        switchChain({ chainId: arcTestnet.id });
      } catch (error) {
        console.error("Failed to switch to Arc network:", error);
      }
    }
  }, [switchChain, isOnArcNetwork]);

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
    currentChain: chainId,
    
    // Balance
    ethBalance,
    
    // Actions
    connect: connectWallet,
    disconnect: disconnectWallet,
    switchToArc,
    
    // Connectors
    connectors,
    isPending,
    isSwitching,

  };
}
