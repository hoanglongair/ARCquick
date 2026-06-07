"use client";

import { useMemo, useCallback } from "react";
import { useAppStore } from "@/stores";
import type { TransactionStatus } from "@/types";

export type TxFilter = "all" | "swap" | "bridge" | "send";
export type StatusFilter = "all" | TransactionStatus;

export function useTransactionHistory() {
  const { transactions, updateTransaction, clearTransactions, pendingTxs } =
    useAppStore();

  const getFiltered = useCallback(
    (filter: TxFilter, statusFilter: StatusFilter) => {
      return transactions.filter((tx) => {
        if (filter !== "all" && tx.type !== filter) return false;
        if (statusFilter !== "all" && tx.status !== statusFilter) return false;
        return true;
      });
    },
    [transactions]
  );

  const groupedByDate = useCallback(
    (txs: typeof transactions) => {
      const groups: Record<string, typeof transactions> = {};

      for (const tx of txs) {
        const date = new Date(tx.timestamp);
        const key = date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        if (!groups[key]) groups[key] = [];
        groups[key].push(tx);
      }

      return Object.entries(groups).map(([date, txs]) => ({
        date,
        transactions: txs,
      }));
    },
    []
  );

  const stats = useMemo(() => {
    const swaps = transactions.filter((t) => t.type === "swap");
    const bridges = transactions.filter((t) => t.type === "bridge");
    const sends = transactions.filter((t) => t.type === "send");
    const confirmed = transactions.filter((t) => t.status === "confirmed");
    const failed = transactions.filter((t) => t.status === "failed");
    const pending = transactions.filter((t) => t.status === "pending");

    return {
      total: transactions.length,
      swapCount: swaps.length,
      bridgeCount: bridges.length,
      sendCount: sends.length,
      confirmedCount: confirmed.length,
      failedCount: failed.length,
      pendingCount: pending.length,
    };
  }, [transactions]);

  const getTxIcon = useCallback((type: string) => {
    switch (type) {
      case "swap":
        return "\u21C4";
      case "bridge":
        return "\u2194";
      case "send":
        return "\u2191";
      default:
        return "\u2022";
    }
  }, []);

  const getTxLabel = useCallback((type: string) => {
    switch (type) {
      case "swap":
        return "Swap";
      case "bridge":
        return "Bridge";
      case "send":
        return "Send";
      default:
        return "Transfer";
    }
  }, []);

  const getStatusColor = useCallback((status: TransactionStatus) => {
    switch (status) {
      case "confirmed":
        return "text-green-500";
      case "failed":
        return "text-red-500";
      case "pending":
        return "text-yellow-500";
      default:
        return "text-muted-foreground";
    }
  }, []);

  const getStatusBg = useCallback((status: TransactionStatus) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/10 border-green-500/30";
      case "failed":
        return "bg-red-500/10 border-red-500/30";
      case "pending":
        return "bg-yellow-500/10 border-yellow-500/30";
      default:
        return "bg-secondary border-border";
    }
  }, []);

  const formatTime = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const formatHash = useCallback((hash?: string) => {
    if (!hash) return "";
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  }, []);

  return {
    transactions,
    getFiltered,
    groupedByDate,
    stats,
    updateTransaction,
    clearTransactions,
    pendingTxs,
    getTxIcon,
    getTxLabel,
    getStatusColor,
    getStatusBg,
    formatTime,
    formatHash,
  };
}
