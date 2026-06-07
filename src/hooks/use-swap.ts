"use client";

import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import type { Token } from "@/types";
import { getSwapQuote, executeSwap, isValidSwapAmount } from "@/lib/app-kit";
import { useAppStore } from "@/stores";

const DEFAULT_FROM_TOKEN: Token = {
  symbol: "ETH",
  address: "0x0000000000000000000000000000000000000000",
  decimals: 18,
  name: "Ethereum",
  icon: "\u039E",
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

export type SwapStatus =
  | "idle"
  | "fetching_quote"
  | "confirming"
  | "pending"
  | "success"
  | "error";

export interface SwapError {
  code: string;
  message: string;
}

export function useSwap() {
  const { address, isConnected } = useAccount();
  const { slippageTolerance, addTransaction } = useAppStore();

  const [fromToken, setFromToken] = useState<Token>(DEFAULT_FROM_TOKEN);
  const [toToken, setToToken] = useState<Token>(DEFAULT_TO_TOKEN);
  const [quote, setQuote] = useState<{
    toAmount: string;
    exchangeRate: number;
    priceImpact: number;
    estimatedGas: string;
    minimumReceived: string;
  } | null>(null);
  const [status, setStatus] = useState<SwapStatus>("idle");
  const [error, setError] = useState<SwapError | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const swapTokens = useCallback(() => {
    setFromToken(toToken);
    setToToken(fromToken);
    setQuote(null);
    setStatus("idle");
    setError(null);
  }, [fromToken, toToken]);

  const clearError = useCallback(() => {
    setError(null);
    setStatus("idle");
  }, []);

  const getQuote = useCallback(
    async (amount: string) => {
      if (!amount || parseFloat(amount) === 0) {
        setQuote(null);
        setStatus("idle");
        return;
      }

      setStatus("fetching_quote");
      setError(null);

      try {
        const result = await getSwapQuote({
          fromToken,
          toToken,
          fromAmount: amount,
          slippageTolerance,
        });

        setQuote({
          toAmount: result.toAmount,
          exchangeRate: result.exchangeRate,
          priceImpact: result.priceImpact,
          estimatedGas: result.estimatedGas,
          minimumReceived: result.minimumReceived,
        });
        setStatus("idle");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch quote";
        setError({ code: "QUOTE_ERROR", message });
        setStatus("error");
        setQuote(null);
      }
    },
    [fromToken, toToken, slippageTolerance]
  );

  const executeSwapTx = useCallback(
    async (fromAmount: string) => {
      if (!address || !isConnected) {
        setError({ code: "NOT_CONNECTED", message: "Please connect your wallet" });
        setStatus("error");
        return null;
      }

      if (!quote) {
        setError({ code: "NO_QUOTE", message: "Please get a quote first" });
        setStatus("error");
        return null;
      }

      const validation = isValidSwapAmount(fromAmount, "999999999");
      if (!validation.valid) {
        setError({ code: "INVALID_AMOUNT", message: validation.error ?? "Invalid amount" });
        setStatus("error");
        return null;
      }

      setStatus("confirming");
      setError(null);

      try {
        const result = await executeSwap({
          quote,
          fromToken,
          toToken,
          fromAmount,
          walletAddress: address,
        });

        setTxHash(result.hash);
        setStatus("pending");

        addTransaction({
          id: result.hash,
          type: "swap",
          status: "pending",
          hash: result.hash,
          fromToken: fromToken.symbol,
          toToken: toToken.symbol,
          fromAmount,
          toAmount: quote.toAmount,
          timestamp: Date.now(),
          chainId: fromToken.chainId,
        });

        setTimeout(() => {
          setStatus("success");
          addTransaction({
            id: result.hash,
            type: "swap",
            status: "confirmed",
            hash: result.hash,
            fromToken: fromToken.symbol,
            toToken: toToken.symbol,
            fromAmount,
            toAmount: quote.toAmount,
            timestamp: Date.now(),
            chainId: fromToken.chainId,
          });
        }, 2000);

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Transaction failed";
        setError({ code: "SWAP_ERROR", message });
        setStatus("error");

        if (txHash) {
          addTransaction({
            id: txHash,
            type: "swap",
            status: "failed",
            hash: txHash,
            fromToken: fromToken.symbol,
            toToken: toToken.symbol,
            fromAmount,
            toAmount: quote?.toAmount ?? "0",
            timestamp: Date.now(),
            chainId: fromToken.chainId,
          });
        }

        return null;
      }
    },
    [address, isConnected, quote, fromToken, toToken, addTransaction, txHash]
  );

  const reset = useCallback(() => {
    setQuote(null);
    setStatus("idle");
    setError(null);
    setTxHash(null);
  }, []);

  return {
    fromToken,
    toToken,
    setFromToken,
    setToToken,
    swapTokens,
    quote,
    status,
    error,
    txHash,
    isLoading: status === "fetching_quote" || status === "confirming",
    getQuote,
    executeSwap: executeSwapTx,
    clearError,
    reset,
  };
}
