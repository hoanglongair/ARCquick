import { ARC_TESTNET_CONFIG } from "@/lib/wagmi/chains";
import type { Token } from "@/types";

export const NATIVE_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000";

/**
 * Single source of truth for all in-app tokens.
 *
 * IMPORTANT: `price` is intentionally NOT set here. Token USD prices come
 * from the live CoinGecko feed (see `use-token-list.ts` / `/api/prices`).
 * Keeping them out of this constant prevents UI from silently rendering
 * stale mock prices. Use `useTokenListWithPrices()` to get tokens with
 * live prices applied.
 *
 * Addresses used:
 * - ETH: native placeholder (0x0)
 * - USDC: real Arc Testnet USDC contract (from ARC_TESTNET_CONFIG.contracts.usdc)
 */
export const TOKENS = {
  ETH: {
    symbol: "ETH",
    address: NATIVE_TOKEN_ADDRESS,
    decimals: 18,
    name: "Ethereum",
    icon: "\u039E",
    chainId: ARC_TESTNET_CONFIG.chainId,
  },
  USDC: {
    symbol: "USDC",
    address: ARC_TESTNET_CONFIG.contracts.usdc,
    decimals: 6,
    name: "USD Coin",
    icon: "$",
    chainId: ARC_TESTNET_CONFIG.chainId,
  },
} as const satisfies Record<string, Token>;

export const TOKEN_LIST: Token[] = [TOKENS.ETH, TOKENS.USDC];

export function getTokenBySymbol(symbol: string): Token | undefined {
  return TOKEN_LIST.find(
    (t) => t.symbol.toUpperCase() === symbol.toUpperCase()
  );
}

export function isNativeTokenAddress(address: string): boolean {
  return (
    address === NATIVE_TOKEN_ADDRESS ||
    address === "0x" ||
    address.toLowerCase() === NATIVE_TOKEN_ADDRESS
  );
}
