"use client";

import { ExternalLink } from "lucide-react";
import { useTransactionHistory } from "@/hooks/use-transaction-history";
import { Badge } from "@/components/ui";

interface TransactionListProps {
  transactions: ReturnType<ReturnType<typeof useTransactionHistory>["getFiltered"]>;
  emptyMessage?: string;
}

export function TransactionList({
  transactions,
  emptyMessage = "No transactions yet",
}: TransactionListProps) {
  const { groupedByDate, getTxIcon, getTxLabel, getStatusBg, formatTime, formatHash } =
    useTransactionHistory();

  if (transactions.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <span className="text-3xl opacity-30">\u2191</span>
        </div>
        <p className="text-muted-foreground">{emptyMessage}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Your transaction history will appear here
        </p>
      </div>
    );
  }

  const groups = groupedByDate(transactions);

  return (
    <div className="space-y-6">
      {groups.map(({ date, transactions: dayTxs }) => (
        <div key={date}>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {date}
          </h3>
          <div className="space-y-2">
            {dayTxs.map((tx) => (
              <div
                key={tx.id}
                className={`rounded-xl border p-4 transition-colors hover:bg-secondary/30 ${getStatusBg(tx.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                      style={{
                        background:
                          tx.type === "swap"
                            ? "hsl(186, 100%, 50%, 0.1)"
                            : tx.type === "bridge"
                              ? "hsl(280, 100%, 60%, 0.1)"
                              : "hsl(45, 100%, 50%, 0.1)",
                      }}
                    >
                      <span
                        style={{
                          color:
                            tx.type === "swap"
                              ? "hsl(186, 100%, 50%)"
                              : tx.type === "bridge"
                                ? "hsl(280, 100%, 60%)"
                                : "hsl(45, 100%, 50%)",
                        }}
                      >
                        {getTxIcon(tx.type)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{getTxLabel(tx.type)}</span>
                        <Badge
                          variant={
                            tx.status === "confirmed"
                              ? "success"
                              : tx.status === "failed"
                                ? "destructive"
                                : "outline"
                          }
                          className="text-[10px]"
                        >
                          {tx.status}
                        </Badge>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {tx.fromAmount} {tx.fromToken}
                          {tx.type !== "send" && ` \u2192 ${tx.toAmount} ${tx.toToken}`}
                          {tx.type === "send" && ` \u2192 ${tx.toToken}`}
                        </span>
                        <span>\u2022</span>
                        <span>{formatTime(tx.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {tx.hash && (
                      <a
                        href={`https://sepolio.arcscan.io/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        title="View on explorer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
