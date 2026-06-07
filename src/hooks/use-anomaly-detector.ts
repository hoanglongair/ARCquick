"use client";

import { useEffect, useCallback, useRef } from "react";
import { useAppStore } from "@/stores";
import { useToast } from "@/components/effects/toast";

interface AnomalyRule {
  id: string;
  name: string;
  description: string;
}

const ANOMALY_RULES: AnomalyRule[] = [
  {
    id: "large_tx",
    name: "Large Transaction",
    description: "Transaction value exceeds 2x your average",
  },
  {
    id: "new_address",
    name: "New Recipient",
    description: "Sending to an address you have not used before",
  },
  {
    id: "unusual_time",
    name: "Unusual Timing",
    description: "Transaction at an unusual hour (local time)",
  },
  {
    id: "rate_limit",
    name: "Rate Limit",
    description: "Multiple transactions in short succession",
  },
];

interface AnomalyAlert {
  ruleId: string;
  ruleName: string;
  severity: "low" | "medium" | "high";
  message: string;
  timestamp: number;
}

export function useAnomalyDetector() {
  const { transactions } = useAppStore();
  const { showToast } = useToast();
  const lastTxTimeRef = useRef<number>(0);
  const txCountRef = useRef<number>(0);

  const detectAnomalies = useCallback((): AnomalyAlert[] => {
    const alerts: AnomalyAlert[] = [];
    const now = Date.now();

    const recentTxs = transactions.filter((tx) => now - tx.timestamp < 24 * 60 * 60 * 1000);
    if (recentTxs.length < 3) return alerts;

    const avgAmount = recentTxs.reduce((sum, tx) => sum + parseFloat(tx.fromAmount || "0"), 0) / recentTxs.length;
    const lastTx = recentTxs[0];

    if (lastTx && parseFloat(lastTx.fromAmount || "0") > avgAmount * 2) {
      alerts.push({
        ruleId: "large_tx",
        ruleName: "Large Transaction",
        severity: parseFloat(lastTx.fromAmount || "0") > avgAmount * 5 ? "high" : "medium",
        message: `Transaction of ${lastTx.fromAmount} ${lastTx.fromToken} is ${(parseFloat(lastTx.fromAmount || "0") / avgAmount).toFixed(1)}x your daily average`,
        timestamp: now,
      });
    }

    const recipientTxs = recentTxs.filter((tx) => tx.toToken === lastTx?.toToken);
    if (recipientTxs.length === 1) {
      alerts.push({
        ruleId: "new_address",
        ruleName: "New Recipient",
        severity: "low",
        message: `First time sending to this recipient (${lastTx?.toToken})`,
        timestamp: now,
      });
    }

    const hour = new Date().getHours();
    if (hour < 6 || hour > 23) {
      alerts.push({
        ruleId: "unusual_time",
        ruleName: "Unusual Timing",
        severity: "low",
        message: `Transaction initiated at ${hour}:00 — outside typical activity hours`,
        timestamp: now,
      });
    }

    if (lastTxTimeRef.current > 0) {
      const gap = now - lastTxTimeRef.current;
      txCountRef.current += 1;
      if (gap < 60_000 && txCountRef.current > 3) {
        alerts.push({
          ruleId: "rate_limit",
          ruleName: "Rate Limit",
          severity: "medium",
          message: `${txCountRef.current} transactions in the last minute`,
          timestamp: now,
        });
      }
    } else {
      txCountRef.current = 1;
    }
    lastTxTimeRef.current = now;

    return alerts;
  }, [transactions]);

  const checkTransaction = useCallback(
    (amount: string, token: string, recipient?: string) => {
      const alerts = detectAnomalies();
      for (const alert of alerts) {
        if (alert.ruleId === "large_tx") {
          showToast(`Security: ${alert.message}`, "error");
        } else if (alert.ruleId === "new_address") {
          showToast(`Security: ${alert.message}`, "info");
        }
      }
      return alerts;
    },
    [detectAnomalies, showToast]
  );

  return { checkTransaction, detectAnomalies, ANOMALY_RULES };
}
