import type { TokenPrice } from "@/hooks/use-price-feed";

const FALLBACK_PRICES: Record<string, number> = {
  ETH: 2847.5,
  WETH: 2847.5,
  USDC: 1,
  EURC: 1.08,
  USDT: 1,
  DAI: 1,
  ARB: 0.75,
  MATIC: 0.5,
};

/**
 * Resolve a token's USD price from a live price map.
 * Order of precedence: live feed → hardcoded fallback → 1 (last resort, prevents NaN).
 */
export function getTokenPriceUsd(
  prices: Record<string, TokenPrice> | null | undefined,
  symbol: string,
  fallback?: number
): number {
  const sym = symbol.toUpperCase();
  const live = prices?.[sym]?.usd;
  if (typeof live === "number" && live > 0) return live;
  if (typeof fallback === "number" && fallback > 0) return fallback;
  const fb = FALLBACK_PRICES[sym];
  if (typeof fb === "number") return fb;
  return 1;
}
