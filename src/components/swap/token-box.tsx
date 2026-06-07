"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui";
import { formatUSD } from "@/lib/utils";
import { isNativeToken } from "@/hooks/use-token-balance";
import type { Token } from "@/types";

interface TokenBoxProps {
  label: string;
  token: Token;
  amount: string;
  balance: string;
  onAmountChange: (value: string) => void;
  onSelect: () => void;
  readOnly?: boolean;
  onMaxClick?: () => void;
}

export function TokenBox({
  label,
  token,
  amount,
  balance,
  onAmountChange,
  onSelect,
  readOnly = false,
  onMaxClick,
}: TokenBoxProps) {
  const isNative = isNativeToken(token);

  const usdValue =
    amount && parseFloat(amount) > 0
      ? parseFloat(amount) * (token.price ?? 0)
      : 0;

  const handleMaxClick = useCallback(() => {
    if (onMaxClick) {
      onMaxClick();
    } else {
      onAmountChange(balance);
    }
  }, [onMaxClick, onAmountChange, balance]);

  const getTokenGradient = () => {
    if (token.symbol === "USDC") return "linear-gradient(135deg, #2775ca, #5badff)";
    if (token.symbol === "EURC") return "linear-gradient(135deg, #1e3a8a, #3b82f6)";
    if (token.symbol === "ETH") return "linear-gradient(135deg, #627eea, #a9b3ff)";
    return "linear-gradient(135deg, #6b7280, #9ca3af)";
  };

  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {!readOnly && (
          <span className="text-xs text-muted-foreground">
            Balance: {balance} {token.symbol}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onSelect}
          className="flex h-12 items-center gap-2 rounded-xl bg-secondary px-3 transition-colors hover:bg-secondary/80"
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
            style={{
              background: getTokenGradient(),
              color: "white",
            }}
          >
            {token.icon}
          </div>
          <span className="font-semibold">{token.symbol}</span>
          <span className="text-muted-foreground">&#9662;</span>
        </button>

        <div className="flex flex-1 flex-col items-end">
          <input
            type="text"
            value={amount}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*\.?\d*$/.test(value)) {
                onAmountChange(value);
              }
            }}
            placeholder="0.0"
            readOnly={readOnly}
            className="w-full bg-transparent text-right text-2xl font-semibold outline-none placeholder:text-muted-foreground"
          />
          {!readOnly && amount && parseFloat(amount) > 0 && (
            <span className="mt-0.5 text-sm text-muted-foreground">
              &#8776; {formatUSD(usdValue)}
            </span>
          )}
        </div>
      </div>

      {!readOnly && (
        <div className="mt-2 flex items-center justify-end gap-2">
          {parseFloat(balance) > 0 && (
            <button
              onClick={handleMaxClick}
              className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
            >
              MAX
            </button>
          )}
          {parseFloat(amount) > parseFloat(balance) && (
            <span className="text-xs text-destructive">Insufficient balance</span>
          )}
        </div>
      )}
    </div>
  );
}
