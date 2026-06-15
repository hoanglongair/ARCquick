"use client";

import { useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { usePriceFeed } from "@/hooks/use-price-feed";
import { useAdvancedTradingStore, type LimitOrder } from "@/stores/advanced-trading-store";
import { useToast } from "@/components/effects/toast";
import { getSwapQuote } from "@/lib/app-kit/swap";
import { useSwap } from "@/hooks/use-swap";
import type { Token } from "@/types";
import { TOKENS } from "@/lib/tokens";

interface TokenMap {
  [symbol: string]: Token;
}

const DEFAULT_TOKEN_MAP: TokenMap = {
  ETH: TOKENS.ETH,
  USDC: TOKENS.USDC,
};

export function useLimitOrderChecker() {
  const { address } = useAccount();
  const { data: prices } = usePriceFeed();
  const { getActiveLimitOrders, updateLimitOrder } = useAdvancedTradingStore();
  const { showToast } = useToast();
  const { setFromToken, setToToken, getQuote, executeSwap } = useSwap();

  const checkAndExecute = useCallback(
    async (order: LimitOrder, livePrice: number) => {
      if (!address) return;

      const shouldExecute =
        (order.side === "buy" && livePrice <= order.targetPrice) ||
        (order.side === "sell" && livePrice >= order.targetPrice);

      if (!shouldExecute) return;

      updateLimitOrder(order.id, { status: "executing", currentPrice: livePrice });

      try {
        const fromToken = DEFAULT_TOKEN_MAP[order.fromToken] ?? DEFAULT_TOKEN_MAP.USDC;
        const toToken = DEFAULT_TOKEN_MAP[order.toToken] ?? DEFAULT_TOKEN_MAP.ETH;

        setFromToken(fromToken);
        setToToken(toToken);

        const quote = await getSwapQuote({
          fromToken,
          toToken,
          fromAmount: order.fromAmount,
          slippageTolerance: 0.5,
        });
        getQuote(order.fromAmount);

        const result = await executeSwap(order.fromAmount);
        if (!result) throw new Error("Swap failed");

        updateLimitOrder(order.id, {
          status: "completed",
          executedAt: Date.now(),
          executedPrice: livePrice,
          txHash: result.hash,
        });

        showToast(
          `Limit order filled: ${order.fromAmount} ${order.fromToken} → ${order.toToken} at $${livePrice.toLocaleString()}`,
          "success"
        );
      } catch {
        updateLimitOrder(order.id, { status: "failed" });
        showToast(`Limit order failed: ${order.fromToken} → ${order.toToken}`, "error");
      }
    },
    [address, updateLimitOrder, showToast, setFromToken, setToToken, getQuote, executeSwap]
  );

  useEffect(() => {
    if (!prices) return;

    const activeOrders = getActiveLimitOrders();
    for (const order of activeOrders) {
      const livePrice = prices[order.toToken]?.usd ?? 0;
      if (livePrice === 0) continue;

      const shouldExecute =
        (order.side === "buy" && livePrice <= order.targetPrice) ||
        (order.side === "sell" && livePrice >= order.targetPrice);

      if (shouldExecute) {
        void checkAndExecute(order, livePrice);
      } else {
        updateLimitOrder(order.id, { currentPrice: livePrice });
      }
    }
  }, [prices, getActiveLimitOrders, checkAndExecute, updateLimitOrder]);
}
