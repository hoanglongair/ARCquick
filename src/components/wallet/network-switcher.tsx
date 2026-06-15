"use client";

import { useAccount, useSwitchChain, useChainId } from "wagmi";
import { cn } from "@/lib/utils";
import { ChevronDown, Zap, ExternalLink } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { arcSepolia, arcTestnet, ARC_TESTNET_CONFIG, isArcTestnet } from "@/lib/wagmi/index";
import { getChainFeatures } from "@/lib/network/chain-features";

const CHAINS = [
  {
    id: 421614,
    name: "Arc Sepolia",
    icon: "🔷",
    color: "#00E5FF",
    testnet: true,
    isArc: true,
  },
  {
    id: 5042002,
    name: "Arc Testnet",
    icon: "🔷",
    color: "#00E5FF",
    testnet: true,
    isArc: true,
    isArcTestnet: true,
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
  const currentChainFeatures = getChainFeatures(chainId);
  const onArcTestnet = isArcTestnet(chainId);

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
    switchChain({ chainId: chainId as 1 | 421614 | 5042002 | 11155111 | 137 | 42161 });
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
        {onArcTestnet && (
          <span
            className="hidden items-center gap-0.5 rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary sm:flex"
            title={`Sub-second finality • ${ARC_TESTNET_CONFIG.blockTimeMs}ms block time`}
          >
            <Zap className="h-2.5 w-2.5" />
            Sub-second
          </span>
        )}
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-border bg-popover p-2 shadow-xl animate-fade-in">
          <div className="mb-2 px-2 text-xs font-medium text-muted-foreground">
            Select Network
          </div>
          {CHAINS.map((chain) => {
            const features = getChainFeatures(chain.id);
            return (
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
                {chain.isArcTestnet && (
                  <span
                    className="flex items-center gap-0.5 rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary"
                    title="Deterministic finality, sub-second blocks"
                  >
                    <Zap className="h-2.5 w-2.5" />
                    Fast
                  </span>
                )}
                {chain.testnet && !chain.isArcTestnet && (
                  <span className="rounded bg-warning/20 px-1.5 py-0.5 text-[10px] font-medium text-warning">
                    Test
                  </span>
                )}
                {chain.id === chainId && (
                  <span className="text-primary">✓</span>
                )}
              </button>
            );
          })}

          {/* Arc Networks Quick Access */}
          {chainId !== arcSepolia.id && chainId !== arcTestnet.id && (
            <>
              <div className="my-2 h-px bg-border" />
              <div className="mb-1 px-2 text-xs font-medium text-muted-foreground">
                Arc Networks
              </div>
              <button
                onClick={() => {
                  handleSwitch(arcSepolia.id);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg bg-primary/10 px-2 py-2 text-sm text-primary transition-colors hover:bg-primary/20"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  🔷
                </div>
                <span className="flex-1 text-left font-medium">
                  Arc Sepolia
                </span>
                <span className="rounded bg-warning/20 px-1.5 py-0.5 text-[10px] font-medium text-warning">
                  Test
                </span>
              </button>
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
                  Arc Testnet
                </span>
                <span className="flex items-center gap-0.5 rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                  <Zap className="h-2.5 w-2.5" />
                  Fast
                </span>
              </button>
            </>
          )}

          {/* Current chain info footer */}
          {currentChainFeatures && (
            <>
              <div className="my-2 h-px bg-border" />
              <div className="space-y-1 px-2 py-1 text-[10px] text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Gas token</span>
                  <span className="font-medium text-foreground">
                    {currentChainFeatures.gasToken ?? "—"}
                  </span>
                </div>
                {currentChainFeatures.finalityType && (
                  <div className="flex items-center justify-between">
                    <span>Finality</span>
                    <span className="font-medium text-foreground">
                      {currentChainFeatures.finalityType}
                    </span>
                  </div>
                )}
                {currentChainFeatures.blockTimeMs && (
                  <div className="flex items-center justify-between">
                    <span>Block time</span>
                    <span className="font-medium text-foreground">
                      {currentChainFeatures.blockTimeMs}ms
                    </span>
                  </div>
                )}
                {onArcTestnet && (
                  <a
                    href={ARC_TESTNET_CONFIG.faucet}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 flex items-center gap-1 text-primary hover:underline"
                  >
                    Get testnet USDC
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
