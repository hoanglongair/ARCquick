"use client";

import { useState, useCallback, useMemo } from "react";
import type { Token } from "@/types";

export interface ChainFeatureInfo {
  id: number;
  name: string;
  swapAvailable: boolean;
  bridgeAvailable: boolean;
  sendAvailable: boolean;
  tokens: string[];
  explorerUrl: string;
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
  },
  11155111: {
    id: 11155111,
    name: "Sepolia",
    swapAvailable: true,
    bridgeAvailable: true,
    sendAvailable: true,
    tokens: ["ETH", "USDC"],
    explorerUrl: "https://sepolia.etherscan.io",
  },
  1: {
    id: 1,
    name: "Ethereum",
    swapAvailable: true,
    bridgeAvailable: true,
    sendAvailable: true,
    tokens: ["ETH", "USDC", "USDT", "DAI"],
    explorerUrl: "https://etherscan.io",
  },
  137: {
    id: 137,
    name: "Polygon",
    swapAvailable: true,
    bridgeAvailable: true,
    sendAvailable: true,
    tokens: ["MATIC", "USDC", "USDT"],
    explorerUrl: "https://polygonscan.com",
  },
  42161: {
    id: 42161,
    name: "Arbitrum",
    swapAvailable: true,
    bridgeAvailable: true,
    sendAvailable: true,
    tokens: ["ETH", "USDC", "USDT", "ARB"],
    explorerUrl: "https://arbiscan.io",
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
  };
}
