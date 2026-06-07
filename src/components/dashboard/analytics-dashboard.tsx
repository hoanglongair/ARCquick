"use client";

import { useMemo } from "react";
import { useAppStore } from "@/stores";
import { useAccount } from "wagmi";
import { StatsCard } from "./stats-card";

const CHART_BARS = 12;

interface VolumeData {
  label: string;
  volume: number;
}

export function AnalyticsDashboard() {
  const { transactions } = useAppStore();
  const { address, isConnected } = useAccount();

  const stats = useMemo(() => {
    const confirmedTxs = transactions.filter((t) => t.status === "confirmed");
    const failedTxs = transactions.filter((t) => t.status === "failed");

    let totalVolumeUSD = 0;
    let totalGasSpentUSD = 0;

    for (const tx of confirmedTxs) {
      const amt = parseFloat(tx.fromAmount);
      if (!isNaN(amt)) {
        totalVolumeUSD += amt;
      }
    }
    totalGasSpentUSD = confirmedTxs.length * 0.0002 * 2847.5;

    return {
      totalTxs: transactions.length,
      confirmedTxs: confirmedTxs.length,
      failedTxs: failedTxs.length,
      pendingTxs: transactions.filter((t) => t.status === "pending").length,
      totalVolumeUSD,
      totalGasSpentUSD,
      avgGasPerTx: confirmedTxs.length > 0 ? totalGasSpentUSD / confirmedTxs.length : 0,
    };
  }, [transactions]);

  const volumeData = useMemo<VolumeData[]>(() => {
    const now = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return Array.from({ length: CHART_BARS }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - CHART_BARS + 1 + i, 1);
      const monthTxs = transactions.filter((tx) => {
        const txDate = new Date(tx.timestamp);
        return txDate.getMonth() === d.getMonth() && txDate.getFullYear() === d.getFullYear();
      });
      const volume = monthTxs.reduce((acc, tx) => acc + parseFloat(tx.fromAmount) * 0.001, 0);
      return { label: months[d.getMonth()], volume };
    });
  }, [transactions]);

  const maxVolume = Math.max(...volumeData.map((d) => d.volume), 1);

  const swapCount = transactions.filter((t) => t.type === "swap").length;
  const bridgeCount = transactions.filter((t) => t.type === "bridge").length;
  const sendCount = transactions.filter((t) => t.type === "send").length;

  if (!isConnected) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Connect your wallet to see analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Volume"
          value={`$${stats.totalVolumeUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          trend={12}
          trendLabel="vs last month"
          color="primary"
        />
        <StatsCard
          title="Total Transactions"
          value={String(stats.totalTxs)}
          subValue={`${stats.confirmedTxs} confirmed`}
          color="green"
        />
        <StatsCard
          title="Gas Spent"
          value={`$${stats.totalGasSpentUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          subValue={`~$${stats.avgGasPerTx.toFixed(2)} avg/tx`}
          trend={-8}
          trendLabel="vs last month"
          color="yellow"
        />
        <StatsCard
          title="Success Rate"
          value={`${stats.totalTxs > 0 ? Math.round((stats.confirmedTxs / stats.totalTxs) * 100) : 0}%`}
          subValue={`${stats.failedTxs} failed`}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">Volume (Last 12 Months)</h3>
          <div className="flex h-40 items-end gap-2">
            {volumeData.map((d, i) => {
              const heightPct = (d.volume / maxVolume) * 100;
              return (
                <div key={i} className="group relative flex flex-1 flex-col items-center">
                  <div
                    className="w-full rounded-t-sm bg-primary/60 transition-all hover:bg-primary"
                    style={{ height: `${Math.max(heightPct, 2)}%` }}
                    title={`${d.label}: $${d.volume.toLocaleString()}`}
                  />
                  <span className="mt-2 text-[10px] text-muted-foreground">{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">Transaction Types</h3>
          <div className="flex items-center gap-6">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                {stats.totalTxs > 0 ? (
                  <>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(240,15%,15%)" strokeWidth="12" />
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke="hsl(186,100%,50%)" strokeWidth="12"
                      strokeDasharray={`${(swapCount / stats.totalTxs) * 251.2} 251.2`}
                    />
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke="hsl(280,100%,60%)" strokeWidth="12"
                      strokeDasharray={`${(bridgeCount / stats.totalTxs) * 251.2} 251.2`}
                      strokeDashoffset={`${-(swapCount / stats.totalTxs) * 251.2}`}
                    />
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke="hsl(45,100%,50%)" strokeWidth="12"
                      strokeDasharray={`${(sendCount / stats.totalTxs) * 251.2} 251.2`}
                      strokeDashoffset={`${-((swapCount + bridgeCount) / stats.totalTxs) * 251.2}`}
                    />
                  </>
                ) : (
                  <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(240,15%,15%)" strokeWidth="12" />
                )}
              </svg>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">Swaps</span>
                <span className="ml-auto text-sm font-semibold">{swapCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ background: "hsl(280,100%,60%)" }} />
                <span className="text-sm text-muted-foreground">Bridges</span>
                <span className="ml-auto text-sm font-semibold">{bridgeCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span className="text-sm text-muted-foreground">Sends</span>
                <span className="ml-auto text-sm font-semibold">{sendCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
