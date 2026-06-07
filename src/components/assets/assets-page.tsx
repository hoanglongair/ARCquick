"use client";

import { useAccount } from "wagmi";
import { Coins, ArrowDownUp, TrendingUp, Wifi } from "lucide-react";
import { UnifiedBalance } from "./unified-balance";
import Link from "next/link";

export function AssetsPage() {
  const { isConnected, chain } = useAccount();

  if (!isConnected) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <Coins className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-30" />
        <p className="text-muted-foreground">Connect your wallet to view assets</p>
      </div>
    );
  }

  const tokens = [
    { symbol: "ETH", name: "Ethereum", bg: "bg-primary/10", text: "text-primary" },
    { symbol: "USDC", name: "USD Coin", bg: "bg-green-500/10", text: "text-green-500" },
    { symbol: "EURC", name: "Euro Coin", bg: "bg-yellow-500/10", text: "text-yellow-500" },
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
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${token.bg} ${token.text}`}
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
                <p className="text-xs text-muted-foreground">Balance fetched on chain</p>
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
          <Link href="/swap" className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 transition-colors hover:bg-secondary/30">
            <ArrowDownUp className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">Swap</span>
          </Link>
          <Link href="/bridge" className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 transition-colors hover:bg-secondary/30">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            <span className="text-xs font-medium">Bridge</span>
          </Link>
          <Link href="/send" className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 transition-colors hover:bg-secondary/30">
            <Wifi className="h-5 w-5 text-green-500" />
            <span className="text-xs font-medium">Send</span>
          </Link>
          <Link href="/receive" className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 transition-colors hover:bg-secondary/30">
            <Coins className="h-5 w-5 text-yellow-500" />
            <span className="text-xs font-medium">Receive</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
