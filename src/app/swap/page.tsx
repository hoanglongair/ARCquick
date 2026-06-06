"use client";

import { Navbar } from "@/components/layout";
import { Card, CardContent } from "@/components/ui";
import { TokenBox } from "@/components/swap/token-box";
import { TokenSelector } from "@/components/swap/token-selector";
import { useAccount } from "wagmi";
import { useState } from "react";
import { ArrowUpDown, Settings } from "lucide-react";
import { Button } from "@/components/ui";
import { useSwap } from "@/hooks/use-swap";
import { useAppStore } from "@/stores";

export default function SwapPage() {
  const { isConnected } = useAccount();
  const { fromToken, toToken, setFromToken, setToToken, swapTokens } =
    useSwap();
  const { slippageTolerance } = useAppStore();
  const [showFromSelector, setShowFromSelector] = useState(false);
  const [showToSelector, setShowToSelector] = useState(false);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  const handleFlipTokens = () => {
    swapTokens();
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const getButtonText = () => {
    if (!isConnected) return "Connect Wallet";
    if (!fromAmount || parseFloat(fromAmount) === 0) return "Enter an amount";
    return `Swap ${fromToken.symbol} → ${toToken.symbol}`;
  };

  const handleSwap = () => {
    if (!isConnected) {
      // Open wallet modal - handled by parent
      return;
    }
    if (!fromAmount || parseFloat(fromAmount) === 0) return;

    // TODO: Execute swap via App Kit
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        <div className="mx-auto max-w-lg px-4 py-12">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-gradient mb-2 text-4xl font-bold">
              Swap Tokens
            </h1>
            <p className="text-muted-foreground">
              Exchange tokens instantly on Arc Network
            </p>
          </div>

          {/* Swap Card */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              {/* Token From */}
              <TokenBox
                label="You Pay"
                token={fromToken}
                amount={fromAmount}
                onAmountChange={setFromAmount}
                onSelect={() => setShowFromSelector(true)}
              />

              {/* Flip Button */}
              <div className="relative z-10 my-2 flex justify-center">
                <button
                  onClick={handleFlipTokens}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background transition-all hover:border-primary hover:bg-primary/10"
                >
                  <ArrowUpDown className="h-5 w-5 text-primary" />
                </button>
              </div>

              {/* Token To */}
              <TokenBox
                label="You Receive"
                token={toToken}
                amount={toAmount}
                onAmountChange={setToAmount}
                onSelect={() => setShowToSelector(true)}
                readOnly
              />

              {/* Route Info */}
              {fromAmount && parseFloat(fromAmount) > 0 && (
                <div className="mt-4 rounded-lg border border-border bg-secondary/50 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rate</span>
                    <span>
                      1 {fromToken.symbol} ={" "}
                      {(parseFloat(fromAmount) / parseFloat(toAmount || "1")).toFixed(
                        4
                      )}{" "}
                      {toToken.symbol}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Slippage</span>
                    <span>{slippageTolerance}%</span>
                  </div>
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Est. Gas</span>
                    <span className="text-muted-foreground">~$0.08</span>
                  </div>
                </div>
              )}

              {/* Swap Button */}
              <Button
                onClick={handleSwap}
                className="mt-4 w-full"
                size="lg"
                disabled={!isConnected || !fromAmount || parseFloat(fromAmount) === 0}
              >
                {getButtonText()}
              </Button>

              {/* Settings Button */}
              <button className="absolute right-4 top-4 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                <Settings className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>

          {/* Info */}
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Powered by Circle App Kit on Arc Network
          </p>
        </div>
      </main>

      {/* Token Selectors */}
      <TokenSelector
        isOpen={showFromSelector}
        onClose={() => setShowFromSelector(false)}
        onSelect={(token) => {
          setFromToken(token);
          setShowFromSelector(false);
        }}
        excludeToken={toToken}
      />

      <TokenSelector
        isOpen={showToSelector}
        onClose={() => setShowToSelector(false)}
        onSelect={(token) => {
          setToToken(token);
          setShowToSelector(false);
        }}
        excludeToken={fromToken}
      />
    </>
  );
}
