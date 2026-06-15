"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/layout";
import { Card, CardContent } from "@/components/ui";
import { ChainSelector } from "./chain-selector";
import { useAccount } from "wagmi";
import {
  ArrowRight,
  Settings,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui";
import { useBridge } from "@/hooks/use-bridge";
import { useTokenBalance } from "@/hooks/use-token-balance";
import { useWalletModal } from "@/components/wallet";
import type { Token } from "@/types";
import { formatUSD } from "@/lib/utils";
import { TOKENS } from "@/lib/tokens";

const USDC_TOKEN: Token = TOKENS.USDC;

export default function BridgePage() {
  const { isConnected, address } = useAccount();
  const { openModal } = useWalletModal();

  const {
    fromChain,
    toChain,
    setFromChain,
    setToChain,
    initializeChains,
    switchChains,
    fromAmount,
    setFromAmount,
    quote,
    status,
    error,
    txHash,
    isLoading,
    getQuote,
    executeBridge,
    clearError,
    reset,
  } = useBridge();

  const [showFromChainSelector, setShowFromChainSelector] = useState(false);
  const [showToChainSelector, setShowToChainSelector] = useState(false);
  const [destinationAddress, setDestinationAddress] = useState("");

  useEffect(() => {
    initializeChains();
  }, [initializeChains]);

  const { formattedBalance: fromBalance } = useTokenBalance({
    token: USDC_TOKEN,
    address,
    watch: true,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (fromAmount) {
        getQuote(fromAmount);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [fromAmount, fromChain, toChain, getQuote]);

  const handleChainSelect = useCallback(
    (chain: { id: number; name: string; icon: string; iconColor: string; nativeCurrency: { name: string; symbol: string }; rpcUrl: string; explorerUrl: string; explorerName: string; isTestnet: boolean }) => {
      if (toChain?.id === chain.id) {
        switchChains();
      } else {
        setFromChain(chain as any);
        reset();
      }
      setShowFromChainSelector(false);
    },
    [toChain, switchChains, setFromChain, reset]
  );

  const handleToChainSelect = useCallback(
    (chain: { id: number; name: string; icon: string; iconColor: string; nativeCurrency: { name: string; symbol: string }; rpcUrl: string; explorerUrl: string; explorerName: string; isTestnet: boolean }) => {
      if (fromChain?.id === chain.id) {
        switchChains();
      } else {
        setToChain(chain as any);
        reset();
      }
      setShowToChainSelector(false);
    },
    [fromChain, switchChains, setToChain, reset]
  );

  const handleBridge = useCallback(async () => {
    if (!isConnected) {
      openModal();
      return;
    }
    if (!fromAmount || parseFloat(fromAmount) === 0) return;
    await executeBridge(fromAmount, destinationAddress || undefined);
  }, [isConnected, openModal, fromAmount, executeBridge, destinationAddress]);

  const getButtonText = () => {
    if (!isConnected) return "Connect Wallet";
    if (status === "fetching_quote") return "Fetching Quote...";
    if (status === "confirming") return "Confirm in Wallet...";
    if (status === "pending") return "Bridge Pending...";
    if (status === "success") return "Bridge Complete!";
    if (status === "error") return error?.message ?? "Bridge Failed";
    if (!fromAmount || parseFloat(fromAmount) === 0) return "Enter an amount";
    if (fromChain?.id === toChain?.id) return "Select Different Chains";
    if (parseFloat(fromAmount) > parseFloat(fromBalance))
      return "Insufficient Balance";
    return "Bridge";
  };

  const isButtonDisabled =
    !isConnected ||
    !fromAmount ||
    parseFloat(fromAmount) === 0 ||
    fromChain?.id === toChain?.id ||
    isLoading ||
    status === "pending" ||
    status === "success";

  const handleCloseSuccess = () => {
    reset();
    setFromAmount("");
    setDestinationAddress("");
  };

  const getChainGradient = (chain: { iconColor?: string } | null) => {
    return chain?.iconColor ?? "linear-gradient(135deg, #627eea, #a9b3ff)";
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        <div className="mx-auto max-w-lg px-4 py-12">
          <div className="mb-8 text-center">
            <h1 className="text-gradient mb-2 text-4xl font-bold">
              Bridge Tokens
            </h1>
            <p className="text-muted-foreground">
              Transfer assets across chains via CCTP
            </p>
          </div>

          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="mb-4 rounded-xl border border-border bg-secondary/30 p-4">
                <label className="mb-2 block text-sm text-muted-foreground">
                  From
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowFromChainSelector(true)}
                    className="flex h-12 items-center gap-2 rounded-xl bg-secondary px-3 transition-colors hover:bg-secondary/80"
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                      style={{
                        background: getChainGradient(fromChain),
                        color: "white",
                      }}
                    >
                      {fromChain?.icon ?? "\u039E"}
                    </div>
                    <span className="font-semibold">
                      {fromChain?.name ?? "Select"}
                    </span>
                    <span className="text-muted-foreground">&#9662;</span>
                  </button>
                  <input
                    type="text"
                    value={fromAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*\.?\d*$/.test(value)) {
                        setFromAmount(value);
                        clearError();
                      }
                    }}
                    placeholder="0.0"
                    className="flex-1 bg-transparent text-right text-2xl font-semibold outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Balance: {fromBalance} USDC
                  </span>
                  {fromAmount && parseFloat(fromAmount) > 0 && (
                    <span className="text-xs text-muted-foreground">
                      &#8776; {formatUSD(parseFloat(fromAmount))}
                    </span>
                  )}
                </div>
              </div>

              <div className="relative z-10 my-2 flex justify-center">
                <button
                  onClick={switchChains}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background transition-all hover:border-primary hover:bg-primary/10"
                >
                  <ArrowRight className="h-5 w-5 rotate-90 text-primary" />
                </button>
              </div>

              <div className="mb-4 rounded-xl border border-border bg-secondary/30 p-4">
                <label className="mb-2 block text-sm text-muted-foreground">
                  To
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowToChainSelector(true)}
                    className="flex h-12 items-center gap-2 rounded-xl bg-secondary px-3 transition-colors hover:bg-secondary/80"
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                      style={{
                        background: getChainGradient(toChain),
                        color: "white",
                      }}
                    >
                      {toChain?.icon ?? "\u039E"}
                    </div>
                    <span className="font-semibold">
                      {toChain?.name ?? "Select"}
                    </span>
                    <span className="text-muted-foreground">&#9662;</span>
                  </button>
                  <div className="flex-1 text-right text-2xl font-semibold text-muted-foreground">
                    {quote?.toAmount ?? "0.00"} USDC
                  </div>
                </div>
                {toChain?.isTestnet && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-yellow-500">
                    <AlertTriangle className="h-3 w-3" />
                    Testnet - for testing only
                  </div>
                )}
              </div>

              {address && (
                <div className="mb-4">
                  <label className="mb-2 block text-sm text-muted-foreground">
                    Destination Address (optional)
                  </label>
                  <input
                    type="text"
                    value={destinationAddress}
                    onChange={(e) => setDestinationAddress(e.target.value)}
                    placeholder={address}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono outline-none placeholder:text-muted-foreground focus:border-primary"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Leave blank to use connected address
                  </p>
                </div>
              )}

              {quote && status !== "success" && (
                <div className="mb-4 rounded-lg border border-border bg-secondary/50 p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Estimated time: {quote.estimatedTime}</span>
                  </div>
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Bridge Fee</span>
                    <span>${quote.bridgeFee}</span>
                  </div>
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Min. Received
                    </span>
                    <span>{quote.minimumReceived} USDC</span>
                  </div>
                </div>
              )}

              {status === "error" && error && (
                <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <XCircle className="h-4 w-4" />
                    <span>{error.message}</span>
                  </div>
                </div>
              )}

              {status === "success" && txHash && (
                <div className="mb-4 rounded-lg border border-green-500/50 bg-green-500/10 p-4">
                  <div className="flex items-center gap-2 text-sm text-green-500">
                    <CheckCircle className="h-4 w-4" />
                    <span>Bridge initiated!</span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Tx: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Funds will arrive on {toChain?.name} in ~{quote?.estimatedTime}
                  </p>
                  <Button
                    onClick={handleCloseSuccess}
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-7 text-xs"
                  >
                    New Bridge
                  </Button>
                </div>
              )}

              {status === "pending" && (
                <div className="mb-4 rounded-lg border border-primary/50 bg-primary/10 p-4">
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Waiting for confirmation...</span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleBridge}
                className="w-full"
                size="lg"
                disabled={isButtonDisabled}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {getButtonText()}
              </Button>

              <button className="absolute right-4 top-4 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                <Settings className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Powered by Circle CCTP on Arc Network
          </p>
        </div>
      </main>

      <ChainSelector
        isOpen={showFromChainSelector}
        onClose={() => setShowFromChainSelector(false)}
        onSelect={handleChainSelect}
        excludeChain={toChain ?? undefined}
        title="Select Source Chain"
      />

      <ChainSelector
        isOpen={showToChainSelector}
        onClose={() => setShowToChainSelector(false)}
        onSelect={handleToChainSelect}
        excludeChain={fromChain ?? undefined}
        title="Select Destination Chain"
      />
    </>
  );
}
