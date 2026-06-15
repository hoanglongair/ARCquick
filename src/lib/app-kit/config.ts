"use client";

import { ARC_TESTNET_CONFIG } from "@/lib/wagmi/chains";

export type AppKitNetwork =
  | "arc-sepolia"
  | "arc-testnet"
  | "ethereum-sepolia"
  | "ethereum";

export const ARC_TESTNET_TOKENS = {
  USDC: {
    symbol: "USDC",
    address: ARC_TESTNET_CONFIG.contracts.usdc,
    decimals: 6,
    nativeDecimals: 18,
    name: "USD Coin",
    icon: "$",
    price: 1,
    isNative: true,
    isGasToken: true,
  },
  EURC: {
    symbol: "EURC",
    address: "0x89B50855Aa3bC8Fb2D573EcbEE3A30Cbcf9629e1",
    decimals: 6,
    name: "Euro Coin",
    icon: "€",
    price: 1.08,
    isNative: false,
    isGasToken: false,
  },
} as const;

export const SUPPORTED_TOKENS = {
  "arc-sepolia": [
    {
      symbol: "USDC",
      address: ARC_TESTNET_CONFIG.contracts.usdc,
      decimals: 6,
      name: "USD Coin",
      icon: "$",
      price: 1,
    },
  ],
  "arc-testnet": [
    {
      symbol: "USDC",
      address: ARC_TESTNET_TOKENS.USDC.address,
      decimals: ARC_TESTNET_TOKENS.USDC.decimals,
      name: ARC_TESTNET_TOKENS.USDC.name,
      icon: ARC_TESTNET_TOKENS.USDC.icon,
      price: ARC_TESTNET_TOKENS.USDC.price,
    },
    {
      symbol: "EURC",
      address: ARC_TESTNET_TOKENS.EURC.address,
      decimals: ARC_TESTNET_TOKENS.EURC.decimals,
      name: ARC_TESTNET_TOKENS.EURC.name,
      icon: ARC_TESTNET_TOKENS.EURC.icon,
      price: ARC_TESTNET_TOKENS.EURC.price,
    },
  ],
  "ethereum-sepolia": [
    {
      symbol: "USDC",
      address: "0x4e0a265B4984F8CA05D2b6bF7d55f59c5C2d4A1e",
      decimals: 6,
      name: "USD Coin",
      icon: "$",
      price: 1,
    },
  ],
} as const;

export const TOKEN_ALIASES = {
  USDC: "USDC",
  EURC: "EURC",
} as const;

export const ARC_TESTNET_BRIDGE_CONFIG = {
  chainId: ARC_TESTNET_CONFIG.chainId,
  cctpDomain: ARC_TESTNET_CONFIG.cctpDomain,
  requiredConfirmations: ARC_TESTNET_CONFIG.requiredConfirmations,
  finalityType: "deterministic" as const,
  avgBlockTimeMs: ARC_TESTNET_CONFIG.blockTimeMs,
  contracts: ARC_TESTNET_CONFIG.contracts,
};

export function getArcTestnetToken(symbol: string) {
  const key = symbol.toUpperCase() as keyof typeof ARC_TESTNET_TOKENS;
  return ARC_TESTNET_TOKENS[key];
}
