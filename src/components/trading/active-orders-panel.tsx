"use client";

import { useState } from "react";
import { Clock, X, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";
import {
  useAdvancedTradingStore,
  type LimitOrder,
  type TwapOrder,
} from "@/stores/advanced-trading-store";
import { usePriceFeed } from "@/hooks/use-price-feed";

export function ActiveOrdersPanel() {
  const { data: prices } = usePriceFeed();
  const {
    limitOrders,
    twapOrders,
    cancelLimitOrder,
    cancelTwapOrder,
    removeLimitOrder,
    removeTwapOrder,
  } = useAdvancedTradingStore();

  const activeLimits = limitOrders.filter((o) => o.status === "pending" || o.status === "executing");
  const activeTwaps = twapOrders.filter((o) => o.status === "pending" || o.status === "executing");
  const pastLimits = limitOrders.filter((o) => !["pending", "executing"].includes(o.status));
  const pastTwaps = twapOrders.filter((o) => !["pending", "executing"].includes(o.status));

  const [showHistory, setShowHistory] = useState(false);

  if (activeLimits.length === 0 && activeTwaps.length === 0 && pastLimits.length === 0 && pastTwaps.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-secondary/30 p-6 text-center">
        <Clock className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No active orders</p>
        <p className="mt-1 text-xs text-muted-foreground/60">Create a limit or TWAP order from the Swap page</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeLimits.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Limit Orders ({activeLimits.length})
          </p>
          <div className="space-y-2">
            {activeLimits.map((order) => (
              <LimitOrderCard key={order.id} order={order} prices={prices} onCancel={cancelLimitOrder} onRemove={removeLimitOrder} />
            ))}
          </div>
        </div>
      )}

      {activeTwaps.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            TWAP Orders ({activeTwaps.length})
          </p>
          <div className="space-y-2">
            {activeTwaps.map((order) => (
              <TwapOrderCard key={order.id} order={order} onCancel={cancelTwapOrder} onRemove={removeTwapOrder} />
            ))}
          </div>
        </div>
      )}

      {(pastLimits.length > 0 || pastTwaps.length > 0) && (
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="mb-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {showHistory ? "Hide" : "Show"} History ({pastLimits.length + pastTwaps.length})
          </button>

          {showHistory && (
            <div className="space-y-2">
              {[...pastLimits, ...pastTwaps].map((order) => (
                <PastOrderCard
                  key={order.id}
                  order={order}
                  onRemove={
                    order.type === "limit"
                      ? (removeLimitOrder as (id: string) => void)
                      : (removeTwapOrder as (id: string) => void)
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LimitOrderCard({
  order,
  prices,
  onCancel,
  onRemove,
}: {
  order: LimitOrder;
  prices: Record<string, { usd: number; change24h: number }> | undefined;
  onCancel: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const livePrice = prices?.[order.toToken]?.usd ?? order.currentPrice;
  const progress =
    (order.side === "buy" && livePrice <= order.targetPrice) ||
    (order.side === "sell" && livePrice >= order.targetPrice)
      ? 100
      : Math.min(
          100,
          Math.abs(
            ((livePrice - order.targetPrice) / (livePrice || 1)) * 100
          )
        );

  const statusColor = {
    pending: "text-muted-foreground",
    executing: "text-yellow-400",
    completed: "text-green-400",
    cancelled: "text-muted-foreground",
    failed: "text-red-400",
  }[order.status];

  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {order.status === "executing" && <Loader2 className="h-3.5 w-3.5 animate-spin text-yellow-400" />}
          <span className="text-sm font-medium">
            {order.side === "buy" ? "Buy" : "Sell"} {order.fromAmount} {order.fromToken}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {order.status === "pending" && (
            <button
              onClick={() => onCancel(order.id)}
              className="rounded px-2 py-0.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => onRemove(order.id)}
            className="rounded p-1 text-muted-foreground hover:text-red-400 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
        <span>Target: ${order.targetPrice.toLocaleString()} / {order.side === "buy" ? "≤" : "≥"}</span>
        <span className={statusColor}>{order.status}</span>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
        <span>Market: ${livePrice.toLocaleString()}</span>
        <span className="text-muted-foreground/60">
          {order.side === "buy" ? "Expires" : "Expires"}{" "}
          {new Date(order.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      <div className="w-full rounded-full bg-secondary h-1">
        <div
          className="h-1 rounded-full bg-cyan-500 transition-all"
          style={{ width: `${Math.min(100, Math.abs(progress))}%` }}
        />
      </div>
    </div>
  );
}

function TwapOrderCard({
  order,
  onCancel,
  onRemove,
}: {
  order: TwapOrder;
  onCancel: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const filled = parseFloat(order.filledAmount);
  const total = parseFloat(order.totalAmount);
  const progress = total > 0 ? (filled / total) * 100 : 0;
  const nextExec = order.nextExecutionAt
    ? new Date(order.nextExecutionAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "N/A";

  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {order.status === "executing" && <Loader2 className="h-3.5 w-3.5 animate-spin text-yellow-400" />}
          <span className="text-sm font-medium">
            TWAP: {order.totalAmount} {order.fromToken} → {order.toToken}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {order.status === "pending" || order.status === "executing" ? (
            <button
              onClick={() => onCancel(order.id)}
              className="rounded px-2 py-0.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          ) : null}
          <button
            onClick={() => onRemove(order.id)}
            className="rounded p-1 text-muted-foreground hover:text-red-400 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
        <span>{order.trancheCount} tranches × every {order.trancheIntervalMinutes}m</span>
        <span className={order.status === "executing" ? "text-yellow-400" : "text-muted-foreground"}>
          {order.status}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
        <span>Filled: {filled.toFixed(4)} / {total}</span>
        <span>Next: {nextExec}</span>
      </div>

      <div className="w-full rounded-full bg-secondary h-1">
        <div
          className="h-1 rounded-full bg-yellow-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-1.5 text-xs text-muted-foreground/60">
        {order.txHashes.length} / {order.trancheCount} tranches filled
      </p>
    </div>
  );
}

function PastOrderCard({
  order,
  onRemove,
}: {
  order: LimitOrder | TwapOrder;
  onRemove: (id: string) => void;
}) {
  const statusIcon = {
    pending: <Clock className="h-3.5 w-3.5 text-muted-foreground" />,
    executing: <Loader2 className="h-3.5 w-3.5 animate-spin text-yellow-400" />,
    completed: <CheckCircle className="h-3.5 w-3.5 text-green-400" />,
    cancelled: <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />,
    failed: <XCircle className="h-3.5 w-3.5 text-red-400" />,
  }[order.status];

  const isLimit = order.type === "limit";
  const lOrder = order as LimitOrder;
  const tOrder = order as TwapOrder;

  return (
    <div className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/10 p-2.5">
      <div className="flex items-center gap-2">
        {statusIcon}
        <div>
          <p className="text-xs font-medium">
            {isLimit
              ? `${(order as LimitOrder).side === "buy" ? "Buy" : "Sell"} ${(order as LimitOrder).fromAmount} ${(order as LimitOrder).fromToken}`
              : `TWAP ${(order as TwapOrder).totalAmount} ${(order as TwapOrder).fromToken}`}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString()}
            {isLimit && lOrder.executedPrice && ` @ $${lOrder.executedPrice.toLocaleString()}`}
            {!isLimit && `${tOrder.txHashes.length}/${tOrder.trancheCount} filled`}
          </p>
        </div>
      </div>
      <button
        onClick={() => onRemove(order.id)}
        className="rounded p-1 text-muted-foreground hover:text-red-400 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
