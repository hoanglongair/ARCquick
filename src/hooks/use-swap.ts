"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { erc20Abi, parseUnits } from "viem";
import type { Token } from "@/types";
import { isValidSwapAmount } from "@/lib/app-kit";
import { TOKENS, isNativeTokenAddress } from "@/lib/tokens";
import { ARC_TESTNET_CONFIG } from "@/lib/wagmi/chains";
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

/**
 * Resolve the actual ERC-20 contract address to call for a given token.
 *
 * Arc Testnet does NOT have ETH - USDC is the native gas token and is exposed
 * through an ERC-20 interface at `0x3600…0000`. Any token whose address is the
 * `0x0` placeholder (i.e. ETH on Arc) must be routed to the USDC contract so
 * the swap hits a real, estimate-able transaction instead of failing
 * `eth_estimateGas` with "Resource not available".
 *
 * When swapping from "ETH" on Arc Testnet, we therefore call
 * `USDC.transfer(address, amount)` with USDC decimals (6). The UI still
 * displays "ETH" - this is a testnet-only placeholder behaviour until a real
 * DEX router is integrated.
 */
function resolveSwapContractAddress(
  token: Token,
  isArcTestnet: boolean
): `0x${string}` {
  if (!isNativeTokenAddress(token.address)) {
    return token.address as `0x${string}`;
  }
  if (isArcTestnet) {
    return ARC_TESTNET_CONFIG.contracts.usdc as `0x${string}`;
  }
  // Fallback for non-Arc chains: keep the placeholder, the caller will fail
  // gracefully rather than silently corrupting state.
  return token.address as `0x${string}`;
}

function resolveSwapAmountDecimals(token: Token, isArcTestnet: boolean): number {
  if (!isNativeTokenAddress(token.address)) {
    return token.decimals;
  }
  if (isArcTestnet) {
    return ARC_TESTNET_CONFIG.nativeCurrency.decimals;
  }
  return token.decimals;
}

export function useSwap() {
  const { address, isConnected, chainId } = useAccount();
  const { slippageTolerance, addTransaction, updateTransaction } = useAppStore();

  const { writeContractAsync } = useWriteContract();

  const isArcTestnet = chainId === ARC_TESTNET_CONFIG.chainId;

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

  useTransactionWatcher(
    pendingTxHash,
    useCallback(() => {
      setStatus("success");
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }, [])
  );

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
        const estimatedGas = "0.001";
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
        const swapDecimals = resolveSwapAmountDecimals(fromToken, isArcTestnet);
        const valueWei = parseUnits(fromAmount, swapDecimals);
        const contractAddress = resolveSwapContractAddress(
          fromToken,
          isArcTestnet
        );

        // Both "native" and ERC-20 routes call an ERC-20 `transfer` against the
        // resolved token contract. On Arc Testnet, the "native" placeholder
        // (ETH, address 0x0) is rewritten to the USDC ERC-20 interface so the
        // transaction can be estimated and submitted cleanly.
        //
        // On Arc Testnet we pass an explicit `gas` to skip viem's
        // `eth_estimateGas` call. Arc Testnet currently returns
        // `Requested resource not available` for `eth_estimateGas` on USDC
        // `transfer` calls even though the same call succeeds from a raw curl
        // against either the public RPC or Alchemy. Hardcoding 100k gas is
        // safe: ERC-20 transfer is fixed-cost (~65k), and 100k stays well
        // inside Arc's block gas limit.
        const writeOptions = isArcTestnet
          ? {
              address: contractAddress,
              abi: erc20Abi,
              functionName: "transfer" as const,
              args: [address, valueWei] as const,
              gas: BigInt(100_000),
            }
          : {
              address: contractAddress,
              abi: erc20Abi,
              functionName: "transfer" as const,
              args: [address, valueWei] as const,
            };

        const hash: `0x${string}` = await writeContractAsync(writeOptions);

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
      writeContractAsync,
      txHash,
      clearPendingTimeout,
      startPendingTimeout,
      isArcTestnet,
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
