"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount } from "wagmi";
import type { BridgeChain } from "@/lib/app-kit/bridge-chains";
import {
  getBridgeQuote,
  executeBridge,
  isValidBridgeAmount,
  isSameChain,
} from "@/lib/app-kit/bridge";
import { useAppStore } from "@/stores";
import { useTransactionWatcher } from "@/hooks/use-transaction-watcher";

export type BridgeStatus =
  | "idle"
  | "fetching_quote"
  | "confirming"
  | "pending"
  | "success"
  | "error";

export interface BridgeError {
  code: string;
  message: string;
}

const DEFAULT_FROM_CHAIN_ID = 421614;
const DEFAULT_TO_CHAIN_ID = 11155111;

export function useBridge() {
  const { address, isConnected } = useAccount();
  const { addTransaction } = useAppStore();

  const [fromChain, setFromChain] = useState<BridgeChain | null>(null);
  const [toChain, setToChain] = useState<BridgeChain | null>(null);
  const [fromAmount, setFromAmount] = useState("");
  const [quote, setQuote] = useState<{
    toAmount: string;
    exchangeRate: number;
    estimatedTime: string;
    bridgeFee: string;
    minimumReceived: string;
  } | null>(null);
  const [status, setStatus] = useState<BridgeStatus>("idle");
  const [error, setError] = useState<BridgeError | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | null>(null);

  const { isSuccess: txConfirmed } = useTransactionWatcher(pendingTxHash, () => {
    setStatus("success");
  });

  const initializeChains = useCallback(() => {
    const { SUPPORTED_BRIDGE_CHAINS, getChainById } = require("@/lib/app-kit/bridge-chains");
    const from = getChainById(DEFAULT_FROM_CHAIN_ID) ?? SUPPORTED_BRIDGE_CHAINS[0];
    const to = getChainById(DEFAULT_TO_CHAIN_ID) ?? SUPPORTED_BRIDGE_CHAINS[1];
    setFromChain(from);
    setToChain(to);
    return { from, to };
  }, []);

  const switchChains = useCallback(() => {
    if (!fromChain || !toChain) return;
    setFromChain(toChain);
    setToChain(fromChain);
    setQuote(null);
    setStatus("idle");
    setError(null);
  }, [fromChain, toChain]);

  const clearError = useCallback(() => {
    setError(null);
    setStatus("idle");
  }, []);

  const reset = useCallback(() => {
    setQuote(null);
    setStatus("idle");
    setError(null);
    setTxHash(null);
    setPendingTxHash(null);
    setFromAmount("");
  }, []);

  const getQuote = useCallback(
    async (amount: string) => {
      if (!amount || parseFloat(amount) === 0) {
        setQuote(null);
        setStatus("idle");
        return;
      }

      if (!fromChain || !toChain) {
        initializeChains();
        return;
      }

      setStatus("fetching_quote");
      setError(null);

      try {
        const result = await getBridgeQuote({
          fromChain,
          toChain,
          fromToken: "USDC",
          toToken: "USDC",
          fromAmount: amount,
        });

        setQuote({
          toAmount: result.toAmount,
          exchangeRate: result.exchangeRate,
          estimatedTime: result.estimatedTime,
          bridgeFee: result.bridgeFee,
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
    [fromChain, toChain, initializeChains]
  );

  const executeBridgeTx = useCallback(
    async (amount: string, destinationAddress?: string) => {
      if (!address || !isConnected) {
        setError({ code: "NOT_CONNECTED", message: "Please connect your wallet" });
        setStatus("error");
        return null;
      }

      if (!fromChain || !toChain) {
        initializeChains();
        return null;
      }

      if (isSameChain(fromChain, toChain)) {
        setError({
          code: "SAME_CHAIN",
          message: "Source and destination chains must be different",
        });
        setStatus("error");
        return null;
      }

      if (!quote) {
        setError({ code: "NO_QUOTE", message: "Please get a quote first" });
        setStatus("error");
        return null;
      }

      const validation = isValidBridgeAmount(amount, "999999999");
      if (!validation.valid) {
        setError({
          code: "INVALID_AMOUNT",
          message: validation.error ?? "Invalid amount",
        });
        setStatus("error");
        return null;
      }

      setStatus("confirming");
      setError(null);

      try {
        const result = await executeBridge({
          quote,
          fromChain,
          toChain,
          fromToken: "USDC",
          toAmount: quote.toAmount,
          walletAddress: address,
          destinationAddress: destinationAddress ?? address,
        });

        setTxHash(result.hash);
        setStatus("pending");

        addTransaction({
          id: result.hash,
          type: "bridge",
          status: "pending",
          hash: result.hash,
          fromToken: fromChain.name,
          toToken: toChain.name,
          fromAmount: amount,
          toAmount: quote.toAmount,
          timestamp: Date.now(),
          chainId: fromChain.id,
        });

        setPendingTxHash(result.hash as `0x${string}`);

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Bridge failed";
        setError({ code: "BRIDGE_ERROR", message });
        setStatus("error");
        return null;
      }
    },
    [address, isConnected, fromChain, toChain, quote, addTransaction, initializeChains]
  );

  return {
    fromChain,
    toChain,
    setFromChain,
    setToChain,
    initializeChains,
    switchChains,
    fromAmount,
    setFromAmount,
    quote,
    status,
    error,
    txHash,
    isLoading: status === "fetching_quote" || status === "confirming",
    getQuote,
    executeBridge: executeBridgeTx,
    clearError,
    reset,
  };
}
