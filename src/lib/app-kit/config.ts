"use client";

export type AppKitNetwork = "arc-sepolia" | "ethereum-sepolia" | "ethereum";

export const SUPPORTED_TOKENS = {
  "arc-sepolia": [
    {
      symbol: "USDC",
      address: "0x036aBf8B88F8C4bDe3d5C2c7a6D7C8a8C9B0D1E",
      decimals: 6,
      name: "USD Coin",
      icon: "$",
      price: 1,
    },
    {
      symbol: "EURC",
      address: "0x1234567890abcdef1234567890abcdef12345678",
      decimals: 6,
      name: "Euro Coin",
      icon: "€",
      price: 1.08,
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
