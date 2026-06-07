"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout";
import { Card, CardContent, Badge } from "@/components/ui";
import { TransactionList } from "./transaction-list";
import { useTransactionHistory, TxFilter } from "@/hooks/use-transaction-history";
import { Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui";

const FILTER_TABS: { key: TxFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "swap", label: "Swaps" },
  { key: "bridge", label: "Bridges" },
  { key: "send", label: "Sends" },
];

export default function TransactionPage() {
  const [filter, setFilter] = useState<TxFilter>("all");
  const {
    transactions,
    getFiltered,
    stats,
    clearTransactions,
    pendingTxs,
  } = useTransactionHistory();

  const filtered = getFiltered(filter, "all");
  const pendingCount = Object.keys(pendingTxs).length;

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        <div className="mx-auto max-w-2xl px-4 py-12">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-gradient mb-1 text-4xl font-bold">
                Transactions
              </h1>
              <p className="text-muted-foreground">
                {stats.total} total transactions
              </p>
            </div>
            <div className="flex gap-2">
              {stats.total > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearTransactions}
                  className="text-xs"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div className="mb-6 flex gap-1 rounded-xl border border-border bg-secondary/30 p-1">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  filter === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {tab.label}
                {tab.key === "all" && stats.total > 0 && (
                  <span className="ml-1.5 rounded bg-white/10 px-1.5 py-0.5 text-xs">
                    {stats.total}
                  </span>
                )}
                {tab.key === "swap" && stats.swapCount > 0 && (
                  <span className="ml-1.5 rounded bg-white/10 px-1.5 py-0.5 text-xs">
                    {stats.swapCount}
                  </span>
                )}
                {tab.key === "bridge" && stats.bridgeCount > 0 && (
                  <span className="ml-1.5 rounded bg-white/10 px-1.5 py-0.5 text-xs">
                    {stats.bridgeCount}
                  </span>
                )}
                {tab.key === "send" && stats.sendCount > 0 && (
                  <span className="ml-1.5 rounded bg-white/10 px-1.5 py-0.5 text-xs">
                    {stats.sendCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {pendingCount > 0 && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
              <RefreshCw className="h-4 w-4 animate-spin text-yellow-500" />
              <span className="text-sm text-yellow-500">
                {pendingCount} pending transaction{pendingCount > 1 ? "s" : ""} - waiting for confirmation
              </span>
            </div>
          )}

          <Card>
            <CardContent className="p-4">
              <TransactionList
                transactions={filtered}
                emptyMessage={
                  filter === "all"
                    ? "No transactions yet"
                    : `No ${filter} transactions`
                }
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
