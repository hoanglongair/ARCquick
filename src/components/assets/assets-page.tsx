"use client";

import { useAccount, useBalance } from "wagmi";
import { useTokenBalance } from "@/hooks";
import { Coins, TrendingUp, ArrowDownUp, Wifi } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { UnifiedBalance } from "./unified-balance";

export function AssetsPage() {
  const { address, isConnected, chain } = useAccount();

  if (!isConnected) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <Coins className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-30" />
        <p className="text-muted-foreground">Connect your wallet to view assets</p>
      </div>
    );
  }

  const tokens = [
    { symbol: "ETH", name: "Ethereum", color: "primary" as const },
    { symbol: "USDC", name: "USD Coin", color: "green" as const },
    { symbol: "EURC", name: "Euro Coin", color: "yellow" as const },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2">
            <Coins className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">Unified Balance</h2>
            <p className="text-sm text-muted-foreground">
              {chain?.name ?? "Unknown Chain"}
            </p>
          </div>
        </div>
        <UnifiedBalance />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          Token Balances
        </h3>
        <div className="space-y-2">
          {tokens.map((token) => (
            <div
              key={token.symbol}
              className="flex items-center justify-between rounded-xl border bg-card p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                    token.symbol === "ETH"
                      ? "bg-primary/10 text-primary"
                      : token.symbol === "USDC"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-yellow-500/10 text-yellow-500"
                  }`}
                >
                  {token.symbol === "ETH" ? "\u039E" : "$"}
                </div>
                <div>
                  <p className="font-semibold">{token.symbol}</p>
                  <p className="text-xs text-muted-foreground">{token.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">--</p>
                <p className="text-xs text-muted-foreground">
                  {address ? "Balance fetched on chain" : "N/A"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 transition-colors hover:bg-secondary/30">
            <ArrowDownUp className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">Swap</span>
          </button>
          <button className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 transition-colors hover:bg-secondary/30">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            <span className="text-xs font-medium">Bridge</span>
          </button>
          <button className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 transition-colors hover:bg-secondary/30">
            <Wifi className="h-5 w-5 text-green-500" />
            <span className="text-xs font-medium">Send</span>
          </button>
          <button className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 transition-colors hover:bg-secondary/30">
            <Coins className="h-5 w-5 text-yellow-500" />
            <span className="text-xs font-medium">Receive</span>
          </button>
        </div>
      </div>
    </div>
  );
}
