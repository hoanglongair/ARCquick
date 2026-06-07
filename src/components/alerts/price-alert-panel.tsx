"use client";

import { useState } from "react";
import { Bell, BellRing, Trash2, TrendingUp, TrendingDown, X } from "lucide-react";
import { Button } from "@/components/ui";
import { usePriceAlertStore, type AlertCondition } from "@/stores/price-alert-store";
import { usePriceFeed } from "@/hooks/use-price-feed";

interface PriceAlertPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PriceAlertPanel({ isOpen, onClose }: PriceAlertPanelProps) {
  const { data: prices } = usePriceFeed();
  const { alerts, addAlert, removeAlert, resetAlert, clearTriggeredAlerts } =
    usePriceAlertStore();

  const [symbol, setSymbol] = useState("ETH");
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition] = useState<AlertCondition>("above");
  const [error, setError] = useState("");

  const activeAlerts = alerts.filter((a) => !a.triggered);
  const triggeredAlerts = alerts.filter((a) => a.triggered);
  const currentPrice = prices?.[symbol]?.usd ?? 0;

  const handleAddAlert = () => {
    setError("");
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) {
      setError("Enter a valid price");
      return;
    }
    if (price === currentPrice) {
      setError("Target price must differ from current price");
      return;
    }
    addAlert({ symbol, targetPrice: price, condition, currentPrice });
    setTargetPrice("");
  };

  if (!isOpen) return null;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-secondary/40 p-4">
        <div className="mb-3 flex items-center gap-2">
          <BellRing className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold">Create Price Alert</h3>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          {["ETH", "USDC", "EURC"].map((s) => (
            <button
              key={s}
              onClick={() => { setSymbol(s); setError(""); }}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                symbol === s
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                  : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {currentPrice > 0 && (
          <p className="mb-2 text-xs text-muted-foreground">
            Current: ${currentPrice.toLocaleString()} &nbsp;
            {prices?.[symbol]?.change24h != null && (
              <span className={prices[symbol].change24h >= 0 ? "text-green-400" : "text-red-400"}>
                {prices[symbol].change24h >= 0 ? "+" : ""}
                {prices[symbol].change24h.toFixed(2)}% 24h
              </span>
            )}
          </p>
        )}

        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setCondition("above")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors ${
              condition === "above"
                ? "bg-green-500/20 text-green-400 border border-green-500/40"
                : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Above
          </button>
          <button
            onClick={() => setCondition("below")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors ${
              condition === "below"
                ? "bg-red-500/20 text-red-400 border border-red-500/40"
                : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            <TrendingDown className="h-3.5 w-3.5" />
            Below
          </button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => { setTargetPrice(e.target.value); setError(""); }}
              placeholder="Target price"
              className="w-full rounded-lg bg-secondary pl-7 pr-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>
          <Button onClick={handleAddAlert} size="sm" className="px-4">
            Set Alert
          </Button>
        </div>
        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      </div>

      {activeAlerts.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Active ({activeAlerts.length})
          </p>
          <div className="space-y-2">
            {activeAlerts.map((alert) => {
              const livePrice = prices?.[alert.symbol]?.usd;
              return (
                <div
                  key={alert.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">{alert.symbol}</span>
                    <span className={`text-xs ${
                      alert.condition === "above" ? "text-green-400" : "text-red-400"
                    }`}>
                      {alert.condition === "above" ? "↑" : "↓"} ${alert.targetPrice.toLocaleString()}
                    </span>
                    {livePrice && (
                      <span className="text-xs text-muted-foreground">
                        (${livePrice.toLocaleString()})
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="rounded p-1 text-muted-foreground hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {triggeredAlerts.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Triggered ({triggeredAlerts.length})
            </p>
            <button
              onClick={clearTriggeredAlerts}
              className="text-xs text-muted-foreground hover:text-cyan-400"
            >
              Clear all
            </button>
          </div>
          <div className="space-y-2">
            {triggeredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between rounded-lg border border-cyan-500/30 bg-cyan-500/5 px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <BellRing className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-sm font-medium">{alert.symbol}</span>
                  <span className="text-xs text-cyan-400">
                    ${alert.targetPrice.toLocaleString()} → ${alert.currentPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => resetAlert(alert.id)}
                    className="rounded p-1 text-xs text-muted-foreground hover:text-cyan-400"
                    title="Re-arm alert"
                  >
                    ↺
                  </button>
                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="rounded p-1 text-muted-foreground hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <p className="text-center py-4 text-sm text-muted-foreground">
          No price alerts set. Create one above.
        </p>
      )}
    </div>
  );
}
