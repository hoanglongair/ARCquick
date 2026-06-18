"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useAccount, useSendTransaction, useWriteContract } from "wagmi";
import { erc20Abi, parseUnits } from "viem";
import type { Token } from "@/types";
import { isValidSwapAmount } from "@/lib/app-kit";
import { TOKENS, isNativeTokenAddress } from "@/lib/tokens";
import { useTokenListWithPrices } from "@/hooks/use-token-list";
import { useAppStore } from "@/stores";
import { useTransactionWatcher } from "@/hooks/use-transaction-watcher";

const PENDING_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

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
  const { slippageTolerance, addTransaction, updateTransaction } = useAppStore();

  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();

  // Live prices from /api/prices → applied to quote calculation.
  const { bySymbol } = useTokenListWithPrices();

  const [fromToken, setFromToken] = useState<Token>(TOKENS.ETH);
  const [toToken, setToToken] = useState<Token>(TOKENS.USDC);
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
  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | null>(null);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useTransactionWatcher(pendingTxHash, () => {
    setStatus("success");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  });

  const clearPendingTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startPendingTimeout = useCallback(
    (hash: string) => {
      clearPendingTimeout();
      timeoutRef.current = setTimeout(() => {
        setError({
          code: "PENDING_TIMEOUT",
          message:
            "Transaction is taking too long to confirm. Check the explorer for status.",
        });
        setStatus("error");
        updateTransaction(hash, { status: "failed" });
        setPendingTxHash(null);
      }, PENDING_TIMEOUT_MS);
    },
    [clearPendingTimeout, updateTransaction]
  );

  useEffect(() => {
    return () => clearPendingTimeout();
  }, [clearPendingTimeout]);

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
        const fromPrice = bySymbol[fromToken.symbol]?.price ?? 1;
        const toPrice = bySymbol[toToken.symbol]?.price ?? 1;
        const rate = fromPrice / toPrice;
        const toAmountFloat = parseFloat(amount) * rate;
        const toAmount = toAmountFloat.toFixed(toToken.decimals > 6 ? 4 : 2);
        const slippageFactor = 1 - slippageTolerance / 100;
        const minimumReceived = (toAmountFloat * slippageFactor).toFixed(
          toToken.decimals > 6 ? 4 : 2
        );
        const estimatedGas = isNativeTokenAddress(fromToken.address) ? "0.002" : "0.008";
        const priceImpact = Math.abs(rate - 1) > 0.05 ? 0.1 : 0.01;

        setQuote({
          toAmount,
          exchangeRate: rate,
          priceImpact,
          estimatedGas,
          minimumReceived,
        });
        setStatus("idle");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch quote";
        setError({ code: "QUOTE_ERROR", message });
        setStatus("error");
        setQuote(null);
      }
    },
    [fromToken, toToken, slippageTolerance, bySymbol]
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
      clearPendingTimeout();

      try {
        const valueWei = parseUnits(fromAmount, fromToken.decimals);
        let hash: `0x${string}`;

        if (isNativeTokenAddress(fromToken.address)) {
          // Native token: self-transfer to the connected wallet.
          // In a real DEX, this would call a router contract.
          hash = await sendTransactionAsync({
            to: address,
            value: valueWei,
          });
        } else {
          // ERC20: call transfer on the token contract.
          // In a real DEX this would approve the router contract.
          hash = await writeContractAsync({
            address: fromToken.address as `0x${string}`,
            abi: erc20Abi,
            functionName: "transfer",
            args: [address, valueWei],
          });
        }

        setTxHash(hash);
        setStatus("pending");

        addTransaction({
          id: hash,
          type: "swap",
          status: "pending",
          hash,
          fromToken: fromToken.symbol,
          toToken: toToken.symbol,
          fromAmount,
          toAmount: quote.toAmount,
          timestamp: Date.now(),
          chainId: fromToken.chainId,
        });

        setPendingTxHash(hash);
        startPendingTimeout(hash);

        return { hash };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Transaction failed";
        setError({ code: "SWAP_ERROR", message });
        setStatus("error");

        if (txHash) {
          updateTransaction(txHash, { status: "failed" });
        }

        return null;
      }
    },
    [
      address,
      isConnected,
      quote,
      fromToken,
      toToken,
      addTransaction,
      updateTransaction,
      sendTransactionAsync,
      writeContractAsync,
      txHash,
      clearPendingTimeout,
      startPendingTimeout,
    ]
  );

  const reset = useCallback(() => {
    clearPendingTimeout();
    setQuote(null);
    setStatus("idle");
    setError(null);
    setTxHash(null);
    setPendingTxHash(null);
  }, [clearPendingTimeout]);

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
