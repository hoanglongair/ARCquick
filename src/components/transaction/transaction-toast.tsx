"use client";

import { ExternalLink, Loader2 } from "lucide-react";
import { useTransactionHistory } from "@/hooks/use-transaction-history";
import { formatUSD } from "@/lib/utils";

interface TransactionToastProps {
  txHash: string;
  type: "swap" | "bridge" | "send";
  fromAmount: string;
  fromToken: string;
  toToken: string;
  onDismiss?: () => void;
}

export function TransactionToast({
  txHash,
  type,
  fromAmount,
  fromToken,
  toToken,
}: TransactionToastProps) {
  const { getTxLabel, formatHash } = useTransactionHistory();

  const label = getTxLabel(type);
  const shortHash = formatHash(txHash);

  return (
    <div
      className="fixed bottom-8 right-8 z-[300] flex items-center gap-3 rounded-xl border px-5 py-4 shadow-lg"
      style={{
        background: "hsl(240, 15%, 6%)",
        borderColor: "rgba(186, 100%, 50%, 0.4)",
      }}
    >
      <Loader2 className="h-5 w-5 animate-spin" style={{ color: "hsl(186, 100%, 50%)" }} />
      <div className="flex flex-col">
        <span className="text-sm font-medium" style={{ color: "hsl(186, 100%, 50%)" }}>
          {label} Pending
        </span>
        <span className="text-xs text-muted-foreground">
          {fromAmount} {fromToken} {type !== "send" ? `\u2192 ${toToken}` : `\u2192 ${toToken}`}
        </span>
        <span className="mt-1 font-mono text-xs text-muted-foreground">{shortHash}</span>
      </div>
      <a
        href={`https://sepolio.arcscan.io/tx/${txHash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg p-2 transition-colors hover:bg-secondary"
      >
        <ExternalLink className="h-4 w-4 text-muted-foreground" />
      </a>
    </div>
  );
}
