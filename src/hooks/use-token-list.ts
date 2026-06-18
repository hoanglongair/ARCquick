"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { TOKENS, TOKEN_LIST } from "@/lib/tokens";
import type { Token } from "@/types";

export interface LiveToken extends Token {
  /** Always present: live price from the API, fallback, or last-resort 1. */
  price: number;
  /** Change vs USD over the last 24h (0 if unknown). */
  change24h: number;
}

interface PricesApiResponse {
  ok: boolean;
  prices?: Record<string, { usd: number; change24h: number; lastUpdated: number }>;
  error?: string;
}

async function fetchPrices(): Promise<
  Record<string, { usd: number; change24h: number; lastUpdated: number }>
> {
  const res = await fetch("/api/prices", { cache: "no-store" });
  if (!res.ok) throw new Error(`Prices API error: ${res.status}`);
  const json = (await res.json()) as PricesApiResponse;
  if (!json.ok || !json.prices) throw new Error(json.error ?? "no data");
  return json.prices;
}

const FALLBACK_PRICES: Record<string, number> = {
  ETH: 1730,
  WETH: 1730,
  USDC: 1,
  EURC: 1.15,
  USDT: 1,
  DAI: 1,
  ARB: 0.08,
  MATIC: 0.5,
};

function resolvePrice(
  symbol: string,
  live?: Record<string, { usd: number }>
): { price: number; change24h: number } {
  const sym = symbol.toUpperCase();
  const livePrice = live?.[sym]?.usd;
  if (typeof livePrice === "number" && livePrice > 0) {
    return { price: livePrice, change24h: live?.[sym] ? live[sym].change24h ?? 0 : 0 };
  }
  const fb = FALLBACK_PRICES[sym];
  return { price: typeof fb === "number" ? fb : 1, change24h: 0 };
}

/**
 * Returns the static token list merged with live USD prices.
 *
 * Behaviour:
 * - Returns the canonical TOKEN_LIST shape (address, decimals, name, icon).
 * - `price` is ALWAYS a number (live > fallback > 1), so downstream UI
 *   doesn't need to null-check.
 * - `change24h` is 0 when no live data is available.
 * - If the API is unreachable, falls back to FALLBACK_PRICES silently —
 *   no UI flicker, no NaN in the swap rate.
 */
export function useTokenListWithPrices(): {
  tokens: LiveToken[];
  bySymbol: Record<string, LiveToken>;
} {
  const { data: live } = useQuery({
    queryKey: ["price-feed"],
    queryFn: fetchPrices,
    refetchInterval: 30_000,
    staleTime: 20_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
  });

  return useMemo(() => {
    const enriched: LiveToken[] = TOKEN_LIST.map((t) => {
      const { price, change24h } = resolvePrice(t.symbol, live);
      return { ...t, price, change24h };
    });
    const bySymbol: Record<string, LiveToken> = {};
    for (const t of enriched) bySymbol[t.symbol] = t;
    return { tokens: enriched, bySymbol };
  }, [live]);
}

/**
 * Lookup a single token by symbol with live price applied.
 * Returns undefined if the symbol is not in the canonical list.
 */
export function useTokenWithPrice(symbol: string): LiveToken | undefined {
  const { bySymbol } = useTokenListWithPrices();
  return bySymbol[symbol.toUpperCase()];
}

export { TOKENS };