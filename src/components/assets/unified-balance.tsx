"use client";

import { useAccount } from "wagmi";
import { useAppStore } from "@/stores";
import { StatsCard } from "@/components/dashboard/stats-card";

interface UnifiedBalanceProps {
  compact?: boolean;
}

export function UnifiedBalance({ compact = false }: UnifiedBalanceProps) {
  const { address, isConnected } = useAccount();
  const { transactions } = useAppStore();

  if (!isConnected || !address) {
    return (
      <div className="rounded-xl border bg-card p-5">
        <p className="text-sm text-muted-foreground">Connect wallet to see balance</p>
      </div>
    );
  }

  const confirmedSwaps = transactions.filter(
    (t) => t.type === "swap" && t.status === "confirmed"
  );

  const totalVolume = confirmedSwaps.reduce((acc, t) => {
    const amt = parseFloat(t.fromAmount);
    return acc + (isNaN(amt) ? 0 : amt);
  }, 0);

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-primary/10 p-2">
          <span className="text-lg">\u03A3</span>
        </div>
        <div>
          <p className="text-xl font-bold">
            ${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground">Total Volume</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-6 text-center">
        <p className="mb-1 text-sm text-muted-foreground">Total Volume Traded</p>
        <p className="text-4xl font-bold">
          ${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {confirmedSwaps.length} swap transactions
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatsCard
          title="Avg Swap Size"
          value={
            confirmedSwaps.length > 0
              ? `$${(totalVolume / confirmedSwaps.length).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
              : "$0"
          }
          color="primary"
        />
        <StatsCard
          title="Bridge Volume"
          value={`$${transactions
            .filter((t) => t.type === "bridge" && t.status === "confirmed")
            .reduce((acc, t) => acc + parseFloat(t.fromAmount), 0)
            .toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          color="purple"
        />
      </div>
    </div>
  );
}
