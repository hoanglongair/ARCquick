"use client";

import { useQuery } from "@tanstack/react-query";

export interface TokenPrice {
  symbol: string;
  usd: number;
  change24h: number;
  lastUpdated: number;
}

interface CoinGeckoSimplePrice {
  [id: string]: {
    usd: number;
    usd_24h_change?: number;
  };
}

const COINGECKO_IDS: Record<string, string> = {
  ETH: "ethereum",
  USDC: "usd-coin",
  EURC: "euro-coin",
  WETH: "weth",
  USDT: "tether",
  DAI: "dai",
  ARB: "arbitrum",
  MATIC: "matic-network",
};

async function fetchPrices(): Promise<Record<string, TokenPrice>> {
  const ids = Object.values(COINGECKO_IDS).join(",");
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

  const res = await fetch(url, {
    next: { revalidate: 0 },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    throw new Error(`CoinGecko API error: ${res.status}`);
  }

  const data: CoinGeckoSimplePrice = await res.json();
  const now = Date.now();

  const prices: Record<string, TokenPrice> = {};

  for (const [symbol, id] of Object.entries(COINGECKO_IDS)) {
    const coinData = data[id];
    if (coinData) {
      prices[symbol] = {
        symbol,
        usd: coinData.usd,
        change24h: coinData.usd_24h_change ?? 0,
        lastUpdated: now,
      };
    }
  }

  return prices;
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
  return prices?.[symbol] ?? null;
}

export function getCoinGeckoId(symbol: string): string {
  return COINGECKO_IDS[symbol.toUpperCase()] ?? symbol.toLowerCase();
}
