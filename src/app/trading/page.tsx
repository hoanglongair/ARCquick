"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ActiveOrdersPanel } from "@/components/trading/active-orders-panel";
import { AdvancedTradingPanel } from "@/components/trading/advanced-trading-panel";
import { Button } from "@/components/ui";
import { Wallet } from "lucide-react";

export default function TradingPage() {
  const { isConnected } = useAccount();
  const [tokenA, setTokenA] = useState("ETH");
  const [tokenB, setTokenB] = useState("USDC");

  const handleSwapPair = () => {
    setTokenA(tokenB);
    setTokenB(tokenA);
  };

  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="mx-auto max-w-xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Advanced Trading</h1>
          <p className="text-sm text-muted-foreground">
            Limit orders, TWAP, and best price routing for optimal execution
          </p>
        </div>

        {!isConnected ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <Wallet className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
            <h2 className="text-lg font-semibold mb-2">Connect your wallet</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Connect your wallet to create and manage advanced orders
            </p>
            <Button size="lg">Connect Wallet</Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold">{tokenA}</span>
                    <button
                      onClick={handleSwapPair}
                      className="rounded p-1 text-muted-foreground hover:bg-secondary transition-colors"
                      title="Swap pair"
                    >
                      ⇄
                    </button>
                    <span className="text-sm font-semibold">{tokenB}</span>
                  </div>
                </div>
              </div>
              <AdvancedTradingPanel tokenA={tokenA} tokenB={tokenB} />
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Active Orders</h2>
              <ActiveOrdersPanel />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
