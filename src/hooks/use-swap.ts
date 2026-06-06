"use client";

import { useState, useCallback } from "react";
import { Token } from "@/types";

const DEFAULT_FROM_TOKEN: Token = {
  symbol: "ETH",
  address: "0x0000000000000000000000000000000000000000",
  decimals: 18,
  name: "Ethereum",
  icon: "Ξ",
  chainId: 421614,
  price: 2847.5,
};

const DEFAULT_TO_TOKEN: Token = {
  symbol: "USDC",
  address: "0x036aBf8B88F8C4bDe3d5C2c7a6D7C8a8C9B0D1E",
  decimals: 6,
  name: "USD Coin",
  icon: "$",
  chainId: 421614,
  price: 1,
};

export function useSwap() {
  const [fromToken, setFromToken] = useState<Token>(DEFAULT_FROM_TOKEN);
  const [toToken, setToToken] = useState<Token>(DEFAULT_TO_TOKEN);
  const [quote, setQuote] = useState<{
    toAmount: string;
    rate: number;
    priceImpact: number;
    gasEstimate: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const swapTokens = useCallback(() => {
    setFromToken(toToken);
    setToToken(fromToken);
    setQuote(null);
  }, [fromToken, toToken]);

  const getQuote = useCallback(
    async (amount: string) => {
      if (!amount || parseFloat(amount) === 0) {
        setQuote(null);
        return;
      }

      setIsLoading(true);

      try {
        // TODO: Call App Kit SDK for real quote
        // For now, calculate mock quote
        const rate = (fromToken.price ?? 0) / (toToken.price ?? 1);
        const toAmount = (parseFloat(amount) * rate * 0.997).toFixed(
          toToken.decimals > 6 ? 4 : 2
        );

        setQuote({
          toAmount,
          rate,
          priceImpact: 0.01,
          gasEstimate: "0.08",
        });
      } catch (error) {
        console.error("Failed to get quote:", error);
        setQuote(null);
      } finally {
        setIsLoading(false);
      }
    },
    [fromToken, toToken]
  );

  const executeSwap = useCallback(async () => {
    if (!quote) return null;

    // TODO: Execute swap via App Kit SDK
    // This will be implemented in Phase 1.4.5

    return {
      hash: "0x" + Math.random().toString(16).slice(2),
      status: "pending" as const,
    };
  }, [quote]);

  return {
    fromToken,
    toToken,
    setFromToken,
    setToToken,
    swapTokens,
    quote,
    isLoading,
    getQuote,
    executeSwap,
  };
}
