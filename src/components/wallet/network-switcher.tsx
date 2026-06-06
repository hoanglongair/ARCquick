"use client";

import { useAccount, useSwitchChain, useChainId } from "wagmi";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { arcTestnet } from "@/lib/wagmi/config";

const CHAINS = [
  {
    id: 421614,
    name: "Arc Sepolia",
    icon: "🔷",
    color: "#00E5FF",
    testnet: true,
  },
  {
    id: 11155111,
    name: "Sepolia",
    icon: "🔷",
    color: "#627EEA",
    testnet: true,
  },
  {
    id: 1,
    name: "Ethereum",
    icon: "Ξ",
    color: "#627EEA",
    testnet: false,
  },
  {
    id: 137,
    name: "Polygon",
    icon: "M",
    color: "#8247E5",
    testnet: false,
  },
  {
    id: 42161,
    name: "Arbitrum",
    icon: "A",
    color: "#28AAE2",
    testnet: false,
  },
];

interface NetworkSwitcherProps {
  className?: string;
}

export function NetworkSwitcher({ className }: NetworkSwitcherProps) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentChain = CHAINS.find((c) => c.id === chainId) || CHAINS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitch = (chainId: number) => {
    switchChain({ chainId: chainId as 1 | 421614 | 11155111 | 137 | 42161 });
    setIsOpen(false);
  };

  if (!isConnected) return null;

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={cn(
          "flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm transition-colors hover:bg-secondary",
          isPending && "opacity-50"
        )}
      >
        <div
          className="h-4 w-4 rounded-full"
          style={{ backgroundColor: currentChain.color }}
        />
        <span className="hidden sm:inline">{currentChain.name}</span>
        {currentChain.testnet && (
          <span className="rounded bg-warning/20 px-1.5 py-0.5 text-[10px] font-medium text-warning">
            Testnet
          </span>
        )}
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-border bg-popover p-2 shadow-xl animate-fade-in">
          <div className="mb-2 px-2 text-xs font-medium text-muted-foreground">
            Select Network
          </div>
          {CHAINS.map((chain) => (
            <button
              key={chain.id}
              onClick={() => handleSwitch(chain.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors",
                chain.id === chainId
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-secondary"
              )}
            >
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: chain.color }}
              >
                {chain.icon}
              </div>
              <span className="flex-1 text-left">{chain.name}</span>
              {chain.testnet && (
                <span className="rounded bg-warning/20 px-1.5 py-0.5 text-[10px] font-medium text-warning">
                  Test
                </span>
              )}
              {chain.id === chainId && (
                <span className="text-primary">✓</span>
              )}
            </button>
          ))}

          {/* Add Arc Network Button */}
          {chainId !== arcTestnet.id && (
            <>
              <div className="my-2 h-px bg-border" />
              <button
                onClick={() => {
                  handleSwitch(arcTestnet.id);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg bg-primary/10 px-2 py-2 text-sm text-primary transition-colors hover:bg-primary/20"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  🔷
                </div>
                <span className="flex-1 text-left font-medium">
                  Switch to Arc Sepolia
                </span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
