"use client";

import { useQuery } from "@tanstack/react-query";

export interface TokenPrice {
  symbol: string;
  usd: number;
  change24h: number;
  lastUpdated: number;
}

interface PricesApiResponse {
  ok: boolean;
  prices?: Record<string, TokenPrice>;
  fetchedAt?: number;
  error?: string;
}

async function fetchPrices(): Promise<Record<string, TokenPrice>> {
  const res = await fetch("/api/prices", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Prices API error: ${res.status}`);
  }
  const json = (await res.json()) as PricesApiResponse;
  if (!json.ok || !json.prices) {
    throw new Error(json.error ?? "Prices API returned no data");
  }
  return json.prices;
}

export function usePriceFeed() {
  return useQuery({
    queryKey: ["price-feed"],
    queryFn: fetchPrices,
    refetchInterval: 30_000,
    staleTime: 20_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
  });
}

export function useTokenPrice(symbol: string) {
  const { data: prices } = usePriceFeed();
  return prices?.[symbol.toUpperCase()] ?? null;
}

export function getCoinGeckoId(symbol: string): string {
  return symbol.toUpperCase();
}