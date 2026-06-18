import { NextResponse } from "next/server";

/**
 * Server-side CoinGecko price proxy.
 *
 * Why this exists:
 * - The browser cannot add the optional `x-cg-pro-api-key` header without
 *   exposing the key, so we centralise the upstream call here.
 * - CoinGecko free public tier rate-limits aggressively (~10-30 calls/min/IP).
 *   We keep an in-memory cache keyed by the symbol set so concurrent requests
 *   share a single upstream fetch and refresh at most every `CACHE_TTL_MS`.
 * - Returning our own shape (`Record<string, TokenPrice>`) decouples the rest
 *   of the app from CoinGecko's response format and lets us swap providers
 *   without touching UI code.
 */

export const dynamic = "force-dynamic";

interface CoinGeckoEntry {
  usd?: number;
  usd_24h_change?: number;
}
type CoinGeckoResponse = Record<string, CoinGeckoEntry>;

export interface TokenPrice {
  symbol: string;
  usd: number;
  change24h: number;
  lastUpdated: number;
}

// Single source of truth for symbol -> CoinGecko id mapping. Keep this here
// so the hook and the route agree without re-declaring the table.
export const COINGECKO_IDS: Record<string, string> = {
  ETH: "ethereum",
  WETH: "weth",
  USDC: "usd-coin",
  EURC: "euro-coin",
  USDT: "tether",
  DAI: "dai",
  ARB: "arbitrum",
  MATIC: "matic-network",
};

const CACHE_TTL_MS = 30_000;
const UPSTREAM_TIMEOUT_MS = 8_000;

interface CacheEntry {
  expires: number;
  data: Record<string, TokenPrice>;
  inflight?: Promise<Record<string, TokenPrice>>;
}

let cache: CacheEntry | null = null;

async function fetchFromUpstream(): Promise<Record<string, TokenPrice>> {
  const ids = Object.values(COINGECKO_IDS).join(",");
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

  const apiKey = process.env.COINGECKO_API_KEY?.trim();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (apiKey) headers["x-cg-pro-api-key"] = apiKey;

  const res = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`CoinGecko upstream returned ${res.status}`);
  }

  const data = (await res.json()) as CoinGeckoResponse;
  const now = Date.now();
  const out: Record<string, TokenPrice> = {};

  for (const [symbol, id] of Object.entries(COINGECKO_IDS)) {
    const entry = data[id];
    if (entry && typeof entry.usd === "number") {
      out[symbol] = {
        symbol,
        usd: entry.usd,
        change24h: typeof entry.usd_24h_change === "number" ? entry.usd_24h_change : 0,
        lastUpdated: now,
      };
    }
  }

  return out;
}

async function getPrices(): Promise<Record<string, TokenPrice>> {
  const now = Date.now();
  if (cache && cache.expires > now) return cache.data;

  if (cache?.inflight) return cache.inflight;

  const inflight = fetchFromUpstream()
    .then((data) => {
      cache = { expires: now + CACHE_TTL_MS, data };
      return data;
    })
    .catch((err) => {
      // On failure, keep whatever stale data we had so the UI doesn't
      // flicker to an empty state on a transient upstream blip.
      if (cache) return cache.data;
      throw err;
    })
    .finally(() => {
      if (cache) cache.inflight = undefined;
    });

  cache = { ...(cache ?? { data: {} as Record<string, TokenPrice> }), inflight };
  return inflight;
}

export async function GET() {
  try {
    const prices = await getPrices();
    return NextResponse.json(
      { ok: true, prices, fetchedAt: Date.now() },
      {
        headers: {
          // Hint to the browser to share the cache briefly. The server cache
          // is the source of truth, this just avoids hammering Next.
          "Cache-Control": "public, max-age=15, stale-while-revalidate=30",
        },
      }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 502 }
    );
  }
}