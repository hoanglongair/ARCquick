"use client";

import { useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { usePriceFeed } from "@/hooks/use-price-feed";
import { useAdvancedTradingStore, type LimitOrder } from "@/stores/advanced-trading-store";
import { useToast } from "@/components/effects/toast";
import { executeSwap } from "@/lib/app-kit/swap";
import { getSwapQuote } from "@/lib/app-kit/swap";
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

export function useLimitOrderChecker() {
  const { address } = useAccount();
  const { data: prices } = usePriceFeed();
  const { getActiveLimitOrders, updateLimitOrder } = useAdvancedTradingStore();
  const { showToast } = useToast();

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

        const quote = await getSwapQuote({
          fromToken,
          toToken,
          fromAmount: order.fromAmount,
          slippageTolerance: 0.5,
        });

        const result = await executeSwap({
          quote,
          fromToken,
          toToken,
          fromAmount: order.fromAmount,
          walletAddress: address,
        });

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
    [address, updateLimitOrder, showToast]
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
