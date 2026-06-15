"use client";

import { Token } from "@/types";
import { X, Search } from "lucide-react";
import { Input } from "@/components/ui";
import { useState, useMemo } from "react";
import { useAccount } from "wagmi";
import { useTokenBalance } from "@/hooks/use-token-balance";
import { TOKEN_LIST } from "@/lib/tokens";

interface TokenSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
  excludeToken?: Token;
}

const DEFAULT_TOKENS: Token[] = TOKEN_LIST;

export function TokenSelector({
  isOpen,
  onClose,
  onSelect,
  excludeToken,
}: TokenSelectorProps) {
  const [search, setSearch] = useState("");

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
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

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

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or symbol"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="max-h-64 space-y-1 overflow-y-auto">
          {filteredTokens.map((token) => (
            <TokenRow key={token.symbol} token={token} onSelect={onSelect} />
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
  const { formattedBalance, isLoading } = useTokenBalance({
    token,
    address,
    watch: true,
  });

  const getTokenGradient = () => {
    if (token.symbol === "USDC") return "linear-gradient(135deg, #2775ca, #5badff)";
    if (token.symbol === "ETH") return "linear-gradient(135deg, #627eea, #a9b3ff)";
    return "linear-gradient(135deg, #6b7280, #9ca3af)";
  };

  return (
    <button
      onClick={() => onSelect(token)}
      className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-secondary"
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold"
        style={{
          background: getTokenGradient(),
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
        {isLoading ? (
          <div className="h-4 w-16 animate-pulse rounded bg-secondary" />
        ) : (
          <div className="font-mono font-medium">{formattedBalance}</div>
        )}
        <div className="text-xs text-muted-foreground">
          ${(token.price ?? 0).toFixed(2)}
        </div>
      </div>
    </button>
  );
}
