"use client";

import { X, Search } from "lucide-react";
import { Input } from "@/components/ui";
import { useState, useMemo } from "react";
import type { BridgeChain } from "@/lib/app-kit/bridge-chains";
import { SUPPORTED_BRIDGE_CHAINS } from "@/lib/app-kit/bridge-chains";

interface ChainSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (chain: BridgeChain) => void;
  excludeChain?: BridgeChain;
  title?: string;
}

export function ChainSelector({
  isOpen,
  onClose,
  onSelect,
  excludeChain,
  title = "Select Chain",
}: ChainSelectorProps) {
  const [search, setSearch] = useState("");

  const filteredChains = useMemo(() => {
    return SUPPORTED_BRIDGE_CHAINS.filter((chain) => {
      if (excludeChain?.id === chain.id) return false;
      if (!search) return true;
      return chain.name.toLowerCase().includes(search.toLowerCase());
    });
  }, [search, excludeChain]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md animate-slide-up rounded-t-2xl border-t border-border bg-popover p-6 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
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
            placeholder="Search by chain name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="max-h-64 space-y-1 overflow-y-auto">
          {filteredChains.map((chain) => (
            <ChainRow
              key={chain.id}
              chain={chain}
              onSelect={() => {
                onSelect(chain);
                onClose();
              }}
            />
          ))}

          {filteredChains.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No chains found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChainRow({
  chain,
  onSelect,
}: {
  chain: BridgeChain;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-secondary"
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold"
        style={{
          background: chain.iconColor,
          color: "white",
        }}
      >
        {chain.icon}
      </div>

      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{chain.name}</span>
          {chain.isTestnet && (
            <span className="rounded bg-yellow-500/20 px-1.5 py-0.5 text-[10px] font-medium text-yellow-500">
              TESTNET
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {chain.nativeCurrency.symbol}
        </div>
      </div>

      <div className="text-right text-xs text-muted-foreground">
        {chain.explorerName}
      </div>
    </button>
  );
}
