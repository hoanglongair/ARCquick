"use client";

import { Token } from "@/types";
import { X, Search } from "lucide-react";
import { Input } from "@/components/ui";
import { useState, useMemo } from "react";
import { useAccount, useBalance } from "wagmi";
import { formatUnits } from "viem";

interface TokenSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
  excludeToken?: Token;
}

const DEFAULT_TOKENS: Token[] = [
  {
    symbol: "USDC",
    address: "0x036aBf8B88F8C4bDe3d5C2c7a6D7C8a8C9B0D1E",
    decimals: 6,
    name: "USD Coin",
    icon: "$",
    chainId: 421614,
    price: 1,
  },
  {
    symbol: "EURC",
    address: "0x1234567890abcdef1234567890abcdef12345678",
    decimals: 6,
    name: "Euro Coin",
    icon: "€",
    chainId: 421614,
    price: 1.08,
  },
  {
    symbol: "ETH",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    name: "Ethereum",
    icon: "Ξ",
    chainId: 421614,
    price: 2847.5,
  },
];

export function TokenSelector({
  isOpen,
  onClose,
  onSelect,
  excludeToken,
}: TokenSelectorProps) {
  const [search, setSearch] = useState("");
  const { address } = useAccount();

  const filteredTokens = useMemo(() => {
    return DEFAULT_TOKENS.filter((token) => {
      if (excludeToken?.symbol === token.symbol) return false;
      if (!search) return true;
      return (
        token.symbol.toLowerCase().includes(search.toLowerCase()) ||
        token.name.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [search, excludeToken]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md animate-slide-up rounded-t-2xl border-t border-border bg-popover p-6 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Select Token</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or symbol"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Token List */}
        <div className="max-h-64 space-y-1 overflow-y-auto">
          {filteredTokens.map((token) => (
            <TokenRow
              key={token.symbol}
              token={token}
              onSelect={onSelect}
            />
          ))}

          {filteredTokens.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No tokens found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TokenRow({
  token,
  onSelect,
}: {
  token: Token;
  onSelect: (token: Token) => void;
}) {
  const { address } = useAccount();
  const { data: balance } = useBalance({
    address,
    token:
      token.symbol === "ETH"
        ? undefined
        : (token.address as `0x${string}`),
  });

  const balanceDisplay = balance
    ? parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4)
    : "0.0000";

  return (
    <button
      onClick={() => onSelect(token)}
      className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-secondary"
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold"
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

      <div className="flex-1 text-left">
        <div className="font-semibold">{token.symbol}</div>
        <div className="text-xs text-muted-foreground">{token.name}</div>
      </div>

      <div className="text-right">
        <div className="font-mono font-medium">{balanceDisplay}</div>
        <div className="text-xs text-muted-foreground">
          ${(token.price ?? 0).toFixed(2)}
        </div>
      </div>
    </button>
  );
}
