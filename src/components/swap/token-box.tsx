"use client";

import { Button } from "@/components/ui";
import { formatNumber, formatUSD } from "@/lib/utils";
import { Token } from "@/types";
import { useAccount, useBalance } from "wagmi";
import { formatUnits } from "viem";

interface TokenBoxProps {
  label: string;
  token: Token;
  amount: string;
  onAmountChange: (value: string) => void;
  onSelect: () => void;
  readOnly?: boolean;
}

export function TokenBox({
  label,
  token,
  amount,
  onAmountChange,
  onSelect,
  readOnly = false,
}: TokenBoxProps) {
  const { address } = useAccount();
  const { data: balance } = useBalance({
    address,
    token: token.address as `0x${string}`,
  });

  const balanceDisplay = balance
    ? parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4)
    : "0.0000";

  const usdValue = balance
    ? parseFloat(formatUnits(balance.value, balance.decimals)) * (token.price ?? 0)
    : 0;

  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {!readOnly && (
          <span className="text-xs text-muted-foreground">
            Balance: {balanceDisplay} {token.symbol}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Token Selector */}
        <button
          onClick={onSelect}
          className="flex h-12 items-center gap-2 rounded-xl bg-secondary px-3 transition-colors hover:bg-secondary/80"
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
            style={{
              background:
                token.symbol === "USDC"
                  ? "linear-gradient(135deg, #2775ca, #5badff)"
                  : token.symbol === "EURC"
                    ? "linear-gradient(135deg, #1e3a8a, #3b82f6)"
                    : "linear-gradient(135deg, #627eea, #a9b3ff)",
              color: "white",
            }}
          >
            {token.icon}
          </div>
          <span className="font-semibold">{token.symbol}</span>
          <span className="text-muted-foreground">▾</span>
        </button>

        {/* Amount Input */}
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
          className="flex-1 bg-transparent text-right text-2xl font-semibold outline-none placeholder:text-muted-foreground"
        />
      </div>

      {!readOnly && amount && parseFloat(amount) > 0 && (
        <div className="mt-2 text-right text-sm text-muted-foreground">
          ≈ {formatUSD(usdValue * (parseFloat(amount) / parseFloat(balanceDisplay || "1")))}
        </div>
      )}
    </div>
  );
}
