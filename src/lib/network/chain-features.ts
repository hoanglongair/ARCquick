"use client";

import { useState, useCallback, useMemo } from "react";
import type { Token } from "@/types";
import { ARC_TESTNET_CONFIG, isArcTestnet } from "@/lib/wagmi/chains";

export interface ChainFeatureInfo {
  id: number;
  name: string;
  swapAvailable: boolean;
  bridgeAvailable: boolean;
  sendAvailable: boolean;
  tokens: string[];
  explorerUrl: string;
  isArcTestnet?: boolean;
  finalityType?: "deterministic" | "probabilistic";
  cctpDomain?: number;
  requiredConfirmations?: number;
  blockTimeMs?: number;
  gasToken?: string;
  minBaseFeeGwei?: number;
}

const CHAIN_FEATURES: Record<number, ChainFeatureInfo> = {
  421614: {
    id: 421614,
    name: "Arc Sepolia",
    swapAvailable: true,
    bridgeAvailable: true,
    sendAvailable: true,
    tokens: ["ETH", "USDC", "EURC"],
    explorerUrl: "https://sepolio.arcscan.io",
    finalityType: "deterministic",
    requiredConfirmations: 1,
    gasToken: "ETH",
  },
  5042002: {
    id: 5042002,
    name: "Arc Testnet",
    swapAvailable: true,
    bridgeAvailable: true,
    sendAvailable: true,
    tokens: ["USDC", "EURC"],
    explorerUrl: ARC_TESTNET_CONFIG.blockExplorer,
    isArcTestnet: true,
    finalityType: "deterministic",
    cctpDomain: ARC_TESTNET_CONFIG.cctpDomain,
    requiredConfirmations: ARC_TESTNET_CONFIG.requiredConfirmations,
    blockTimeMs: ARC_TESTNET_CONFIG.blockTimeMs,
    gasToken: "USDC",
    minBaseFeeGwei: ARC_TESTNET_CONFIG.minBaseFeeGwei,
  },
  11155111: {
    id: 11155111,
    name: "Sepolia",
    swapAvailable: true,
    bridgeAvailable: true,
    sendAvailable: true,
    tokens: ["ETH", "USDC"],
    explorerUrl: "https://sepolia.etherscan.io",
    finalityType: "probabilistic",
    requiredConfirmations: 64,
    gasToken: "ETH",
  },
  1: {
    id: 1,
    name: "Ethereum",
    swapAvailable: true,
    bridgeAvailable: true,
    sendAvailable: true,
    tokens: ["ETH", "USDC", "USDT", "DAI"],
    explorerUrl: "https://etherscan.io",
    finalityType: "probabilistic",
    requiredConfirmations: 64,
    gasToken: "ETH",
  },
  137: {
    id: 137,
    name: "Polygon",
    swapAvailable: true,
    bridgeAvailable: true,
    sendAvailable: true,
    tokens: ["MATIC", "USDC", "USDT"],
    explorerUrl: "https://polygonscan.com",
    finalityType: "probabilistic",
    requiredConfirmations: 20,
    gasToken: "MATIC",
  },
  42161: {
    id: 42161,
    name: "Arbitrum",
    swapAvailable: true,
    bridgeAvailable: true,
    sendAvailable: true,
    tokens: ["ETH", "USDC", "USDT", "ARB"],
    explorerUrl: "https://arbiscan.io",
    finalityType: "probabilistic",
    requiredConfirmations: 20,
    gasToken: "ETH",
  },
};

export function getChainFeatures(chainId: number): ChainFeatureInfo | undefined {
  return CHAIN_FEATURES[chainId];
}

export function getAvailableFeatures(chainId: number) {
  const info = CHAIN_FEATURES[chainId];
  if (!info) return null;

  const features: string[] = [];
  if (info.swapAvailable) features.push("Swap");
  if (info.bridgeAvailable) features.push("Bridge");
  if (info.sendAvailable) features.push("Send");

  return {
    features,
    tokenCount: info.tokens.length,
    tokens: info.tokens,
    isArcTestnet: info.isArcTestnet ?? false,
    finalityType: info.finalityType,
    cctpDomain: info.cctpDomain,
    requiredConfirmations: info.requiredConfirmations,
    blockTimeMs: info.blockTimeMs,
    gasToken: info.gasToken,
    minBaseFeeGwei: info.minBaseFeeGwei,
  };
}

export function isArcTestnetChain(chainId: number | undefined): boolean {
  return isArcTestnet(chainId);
}
