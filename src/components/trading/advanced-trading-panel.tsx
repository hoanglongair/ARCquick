"use client";

import { useState } from "react";
import { Clock, Zap, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { useAdvancedTradingStore } from "@/stores/advanced-trading-store";
import { usePriceFeed } from "@/hooks/use-price-feed";
import { getRouterConfig } from "@/lib/app-kit/router";
import type { Token } from "@/types";

interface AdvancedTradingPanelProps {
  tokenA: string;
  tokenB: string;
  onCreateOrder?: (order: unknown) => void;
}

export function AdvancedTradingPanel({ tokenA, tokenB }: AdvancedTradingPanelProps) {
  const { data: prices } = usePriceFeed();
  const [activeTab, setActiveTab] = useState<"limit" | "twap" | "routes">("limit");

  return (
    <div className="space-y-3">
      <div className="flex gap-1 rounded-lg bg-secondary/50 p-1">
        {(["limit", "twap", "routes"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
              activeTab === tab
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            {tab === "twap" ? "TWAP" : tab === "routes" ? "Routes" : "Limit"}
          </button>
        ))}
      </div>

      {activeTab === "limit" && (
        <LimitOrderForm tokenA={tokenA} tokenB={tokenB} prices={prices} />
      )}
      {activeTab === "twap" && (
        <TwapOrderForm tokenA={tokenA} tokenB={tokenB} prices={prices} />
      )}
      {activeTab === "routes" && (
        <RoutesPanel tokenA={tokenA} tokenB={tokenB} />
      )}
    </div>
  );
}

function LimitOrderForm({
  tokenA,
  tokenB,
  prices,
}: {
  tokenA: string;
  tokenB: string;
  prices: Record<string, { usd: number; change24h: number }> | undefined;
}) {
  const { addLimitOrder } = useAdvancedTradingStore();
  const [fromAmount, setFromAmount] = useState("");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [targetPrice, setTargetPrice] = useState("");
  const [expiryHours, setExpiryHours] = useState(24);
  const [error, setError] = useState("");

  const currentMarketPrice = prices?.[tokenB]?.usd ?? 0;
  const change24h = prices?.[tokenB]?.change24h ?? 0;

  const handleCreate = () => {
    setError("");
    const amount = parseFloat(fromAmount);
    const price = parseFloat(targetPrice);

    if (!fromAmount || isNaN(amount) || amount <= 0) {
      setError("Enter a valid amount");
      return;
    }
    if (!targetPrice || isNaN(price) || price <= 0) {
      setError("Enter a valid target price");
      return;
    }

    const fromToken = side === "buy" ? tokenB : tokenA;
    const toToken = side === "buy" ? tokenA : tokenB;
    const rate = side === "buy"
      ? currentMarketPrice / price
      : price / currentMarketPrice;
    const toAmount = (amount * rate).toFixed(6);

    addLimitOrder({
      fromToken,
      toToken,
      fromAmount: fromAmount,
      toAmount,
      targetPrice: price,
      side,
      expiresAt: Date.now() + expiryHours * 60 * 60 * 1000,
    });

    setFromAmount("");
    setTargetPrice("");
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-secondary/30 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold">Limit Order</h3>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => setSide("buy")}
            className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
              side === "buy"
                ? "bg-green-500/20 text-green-400 border border-green-500/40"
                : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            Buy {tokenA}
          </button>
          <button
            onClick={() => setSide("sell")}
            className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
              side === "sell"
                ? "bg-red-500/20 text-red-400 border border-red-500/40"
                : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            Sell {tokenA}
          </button>
        </div>

        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>Market: {tokenB}</span>
          {currentMarketPrice > 0 && (
            <div className="flex items-center gap-2">
              <span>${currentMarketPrice.toLocaleString()}</span>
              <span className={change24h >= 0 ? "text-green-400" : "text-red-400"}>
                {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              {side === "buy" ? `Pay in ${tokenB}` : `Sell ${tokenA}`}
            </label>
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.0"
              className="w-full rounded-lg bg-secondary px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Target price ({tokenB})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder={currentMarketPrice > 0 ? currentMarketPrice.toFixed(2) : "0.00"}
                className="w-full rounded-lg bg-secondary pl-7 pr-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Expires in</label>
            <div className="flex gap-2">
              {[1, 6, 12, 24, 72].map((h) => (
                <button
                  key={h}
                  onClick={() => setExpiryHours(h)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                    expiryHours === h
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

        <Button onClick={handleCreate} className="mt-3 w-full">
          Create Limit Order
        </Button>
      </div>
    </div>
  );
}

function TwapOrderForm({
  tokenA,
  tokenB,
  prices,
}: {
  tokenA: string;
  tokenB: string;
  prices: Record<string, { usd: number }> | undefined;
}) {
  const { addTwapOrder } = useAdvancedTradingStore();
  const [totalAmount, setTotalAmount] = useState("");
  const [trancheCount, setTrancheCount] = useState(4);
  const [intervalMinutes, setIntervalMinutes] = useState(60);
  const [error, setError] = useState("");

  const handleCreate = () => {
    setError("");
    const amount = parseFloat(totalAmount);

    if (!totalAmount || isNaN(amount) || amount <= 0) {
      setError("Enter a valid amount");
      return;
    }

    addTwapOrder({
      fromToken: tokenB,
      toToken: tokenA,
      totalAmount: totalAmount,
      trancheCount,
      trancheIntervalMinutes: intervalMinutes,
      expiresAt: Date.now() + trancheCount * intervalMinutes * 60 * 1000,
    });

    setTotalAmount("");
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-secondary/30 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-400" />
          <h3 className="text-sm font-semibold">TWAP Order</h3>
        </div>

        <div className="mb-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3">
          <p className="text-xs text-yellow-300">
            TWAP splits your order into {trancheCount} equal tranches, executing every {intervalMinutes} min.
            Total duration: ~{Math.round(trancheCount * intervalMinutes / 60)}h
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Total amount ({tokenB})
            </label>
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="0.0"
              className="w-full rounded-lg bg-secondary px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            {parseFloat(totalAmount) > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                Per tranche: {(parseFloat(totalAmount) / trancheCount).toFixed(2)} {tokenB}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Number of tranches
            </label>
            <div className="flex gap-2">
              {[2, 4, 8, 12].map((n) => (
                <button
                  key={n}
                  onClick={() => setTrancheCount(n)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                    trancheCount === n
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Interval between tranches
            </label>
            <div className="flex gap-2">
              {[15, 30, 60, 240].map((m) => (
                <button
                  key={m}
                  onClick={() => setIntervalMinutes(m)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                    intervalMinutes === m
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  {m < 60 ? `${m}m` : `${m / 60}h`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

        <Button onClick={handleCreate} className="mt-3 w-full">
          Create TWAP Order
        </Button>
      </div>
    </div>
  );
}

function RoutesPanel({ tokenA, tokenB }: { tokenA: string; tokenB: string }) {
  const [amount, setAmount] = useState("1");
  const [showRoutes, setShowRoutes] = useState(false);
  const [routes, setRoutes] = useState<Awaited<ReturnType<typeof import("@/lib/app-kit/router").getBestRoute>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCompare = async () => {
    setLoading(true);
    setError("");
    try {
      const { getBestRoute } = await import("@/lib/app-kit/router");
      const fromT: Token = { symbol: tokenB, address: "0x036aBf8B88F8C4bDe3d5C2c7a6D7C8a8C9B0D1E", decimals: 6, name: tokenB, icon: "$", chainId: 421614, price: 1 };
      const toT: Token = { symbol: tokenA, address: "0x0000000000000000000000000000000000000000", decimals: 18, name: tokenA, icon: "Ξ", chainId: 421614, price: 2847.5 };
      const result = await getBestRoute({ fromToken: fromT, toToken: toT, fromAmount: amount, slippageTolerance: 0.5 });
      setRoutes(result);
      setShowRoutes(true);
    } catch {
      setError("Failed to fetch routes");
    } finally {
      setLoading(false);
    }
  };

  const routerConfig = getRouterConfig();

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-secondary/30 p-4">
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-purple-400" />
          <h3 className="text-sm font-semibold">Best Price Routing</h3>
        </div>

        <div className="mb-3">
          <label className="mb-1 block text-xs text-muted-foreground">Amount ({tokenB})</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setShowRoutes(false); }}
            placeholder="1.0"
            className="w-full rounded-lg bg-secondary px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <Button onClick={handleCompare} disabled={loading} className="w-full" variant="outline">
          {loading ? "Comparing..." : "Compare Routes"}
        </Button>

        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

        {showRoutes && routes && (
          <div className="mt-4 space-y-2">
            {routes.allRoutes.map((route, idx) => {
              const isBest = idx === 0;
              return (
                <div
                  key={route.routeId}
                  className={`rounded-lg border p-3 text-xs ${
                    isBest
                      ? "border-cyan-500/40 bg-cyan-500/5"
                      : "border-border bg-secondary/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isBest && <span className="text-cyan-400 text-[10px] font-bold">BEST</span>}
                      <span className="font-medium">{route.routeName}</span>
                    </div>
                    <span className="font-semibold">
                      {route.toAmount} {tokenA}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-muted-foreground">
                    <span>Rate: {route.exchangeRate.toFixed(4)}</span>
                    <span>Gas: ~{route.estimatedGas} ETH</span>
                  </div>
                </div>
              );
            })}
            {routes.savingsPercent > 0.1 && (
              <div className="mt-2 rounded-lg bg-green-500/10 border border-green-500/20 p-2 text-center">
                <p className="text-xs text-green-400">
                  Best route saves {routes.savingsPercent.toFixed(2)}% vs worst route
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
