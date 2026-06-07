"use client";

import type { Token } from "@/types";

export interface RouteQuote {
  routeId: string;
  routeName: string;
  toAmount: string;
  exchangeRate: number;
  priceImpact: number;
  estimatedGas: string;
  minimumReceived: string;
}

export interface BestRouteResult {
  bestRoute: RouteQuote;
  allRoutes: RouteQuote[];
  savings: string;
  savingsPercent: number;
}

export interface RouterConfig {
  routes: {
    id: string;
    name: string;
    feePercent: number;
    gasMultiplier: number;
  }[];
}

const DEFAULT_ROUTER_CONFIG: RouterConfig = {
  routes: [
    { id: "appkit", name: "AppKit (CCTP)", feePercent: 0, gasMultiplier: 1.0 },
    { id: "uniswap-v2", name: "Uniswap V2", feePercent: 0.3, gasMultiplier: 1.2 },
    { id: "uniswap-v3", name: "Uniswap V3", feePercent: 0.05, gasMultiplier: 1.5 },
    { id: "curve", name: "Curve", feePercent: 0.04, gasMultiplier: 1.3 },
    { id: "balancer", name: "Balancer", feePercent: 0.1, gasMultiplier: 1.4 },
  ],
};

function calculateRouteQuote(
  fromToken: Token,
  toToken: Token,
  fromAmount: string,
  slippageTolerance: number,
  config: (typeof DEFAULT_ROUTER_CONFIG.routes)[number]
): RouteQuote {
  const rate = (fromToken.price ?? 1) / (toToken.price ?? 1);
  const effectiveRate = rate * (1 - config.feePercent / 100);
  const toAmountFloat = parseFloat(fromAmount) * effectiveRate;
  const toAmount = toAmountFloat.toFixed(toToken.decimals > 6 ? 4 : 2);
  const slippageFactor = 1 - slippageTolerance / 100;
  const minimumReceived = (toAmountFloat * slippageFactor).toFixed(
    toToken.decimals > 6 ? 4 : 2
  );

  const baseGas = fromToken.address === "0x0000000000000000000000000000000000000000" ? "0.002" : "0.008";
  const estimatedGas = (parseFloat(baseGas) * config.gasMultiplier).toFixed(6);

  const priceImpact = Math.abs(rate - 1) > 0.05 ? 0.1 : 0.01;

  return {
    routeId: config.id,
    routeName: config.name,
    toAmount,
    exchangeRate: effectiveRate,
    priceImpact,
    estimatedGas,
    minimumReceived,
  };
}

export async function getBestRoute(params: {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  slippageTolerance: number;
  config?: RouterConfig;
}): Promise<BestRouteResult> {
  const { fromToken, toToken, fromAmount, slippageTolerance, config = DEFAULT_ROUTER_CONFIG } = params;

  if (!fromAmount || parseFloat(fromAmount) === 0) {
    throw new Error("Invalid amount");
  }

  const allRoutes = config.routes.map((route) =>
    calculateRouteQuote(fromToken, toToken, fromAmount, slippageTolerance, route)
  );

  allRoutes.sort((a, b) => parseFloat(b.toAmount) - parseFloat(a.toAmount));

  const bestRoute = allRoutes[0];
  const worstRoute = allRoutes[allRoutes.length - 1];

  const bestAmount = parseFloat(bestRoute.toAmount);
  const worstAmount = parseFloat(worstRoute.toAmount);
  const savings = (bestAmount - worstAmount).toFixed(toToken.decimals > 6 ? 4 : 2);
  const savingsPercent = worstAmount > 0 ? ((bestAmount - worstAmount) / worstAmount) * 100 : 0;

  return {
    bestRoute,
    allRoutes,
    savings,
    savingsPercent,
  };
}

export async function getRouteQuote(params: {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  slippageTolerance: number;
  routeId: string;
}): Promise<RouteQuote> {
  const { fromToken, toToken, fromAmount, slippageTolerance, routeId } = params;
  const routeConfig = DEFAULT_ROUTER_CONFIG.routes.find((r) => r.id === routeId);

  if (!routeConfig) {
    throw new Error(`Unknown route: ${routeId}`);
  }

  return calculateRouteQuote(fromToken, toToken, fromAmount, slippageTolerance, routeConfig);
}

export function getRouterConfig(): RouterConfig {
  return DEFAULT_ROUTER_CONFIG;
}
