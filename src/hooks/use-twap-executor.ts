"use client";

import { useEffect, useCallback, useRef } from "react";
import { useAccount } from "wagmi";
import { useAdvancedTradingStore, type TwapOrder } from "@/stores/advanced-trading-store";
import { useToast } from "@/components/effects/toast";
import { executeSwap, getSwapQuote } from "@/lib/app-kit/swap";
import type { Token } from "@/types";

interface TokenMap {
  [symbol: string]: Token;
}

const DEFAULT_TOKEN_MAP: TokenMap = {
  ETH: {
    symbol: "ETH",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    name: "Ethereum",
    icon: "Ξ",
    chainId: 421614,
    price: 2847.5,
  },
  USDC: {
    symbol: "USDC",
    address: "0x036aBf8B88F8C4bDe3d5C2c7a6D7C8a8C9B0D1E",
    decimals: 6,
    name: "USD Coin",
    icon: "$",
    chainId: 421614,
    price: 1,
  },
  EURC: {
    symbol: "EURC",
    address: "0x1234567890abcdef1234567890abcdef12345678",
    decimals: 6,
    name: "Euro Coin",
    icon: "€",
    chainId: 421614,
    price: 1.08,
  },
};

export function useTwapExecutor() {
  const { address } = useAccount();
  const { getActiveTwapOrders, updateTwapOrder } = useAdvancedTradingStore();
  const { showToast } = useToast();
  const executingRef = useRef<Set<string>>(new Set());

  const executeTranche = useCallback(
    async (order: TwapOrder) => {
      if (!address || executingRef.current.has(order.id)) return;

      const trancheAmount = (parseFloat(order.totalAmount) / order.trancheCount).toFixed(6);
      const filledSoFar = parseFloat(order.filledAmount);
      const remaining = parseFloat(order.totalAmount) - filledSoFar;

      if (remaining <= 0) {
        updateTwapOrder(order.id, { status: "completed" });
        showToast(`TWAP completed: ${order.totalAmount} ${order.fromToken}`, "success");
        return;
      }

      const actualTranche = Math.min(parseFloat(trancheAmount), remaining).toFixed(6);
      executingRef.current.add(order.id);

      updateTwapOrder(order.id, { status: "executing" });

      try {
        const fromToken = DEFAULT_TOKEN_MAP[order.fromToken] ?? DEFAULT_TOKEN_MAP.USDC;
        const toToken = DEFAULT_TOKEN_MAP[order.toToken] ?? DEFAULT_TOKEN_MAP.ETH;

        const quote = await getSwapQuote({
          fromToken,
          toToken,
          fromAmount: actualTranche,
          slippageTolerance: 0.5,
        });

        const result = await executeSwap({
          quote,
          fromToken,
          toToken,
          fromAmount: actualTranche,
          walletAddress: address,
        });

        const newFilled = (filledSoFar + parseFloat(actualTranche)).toFixed(6);
        const nextExecutionAt = Date.now() + order.trancheIntervalMinutes * 60 * 1000;
        const isLastTranche = parseFloat(newFilled) >= parseFloat(order.totalAmount);

        updateTwapOrder(order.id, {
          status: isLastTranche ? "completed" : "executing",
          filledAmount: newFilled,
          lastExecutedAt: Date.now(),
          nextExecutionAt: isLastTranche ? undefined : nextExecutionAt,
          txHashes: [...order.txHashes, result.hash],
        });

        showToast(
          `TWAP tranche ${order.txHashes.length + 1}/${order.trancheCount} filled`,
          "success"
        );
      } catch {
        updateTwapOrder(order.id, { status: "failed" });
        showToast(`TWAP tranche failed: ${order.fromToken} → ${order.toToken}`, "error");
      } finally {
        executingRef.current.delete(order.id);
      }
    },
    [address, updateTwapOrder, showToast]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const activeOrders = getActiveTwapOrders();

      for (const order of activeOrders) {
        if (order.status !== "pending" && order.status !== "executing") continue;
        if (executingRef.current.has(order.id)) continue;

        const nextExec = order.nextExecutionAt ?? order.createdAt + order.trancheIntervalMinutes * 60 * 1000;
        if (now >= nextExec) {
          void executeTranche(order);
        }
      }
    }, 10_000);

    return () => clearInterval(interval);
  }, [getActiveTwapOrders, executeTranche]);
}
