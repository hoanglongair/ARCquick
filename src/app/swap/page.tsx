"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/layout";
import { Card, CardContent } from "@/components/ui";
import { TokenBox, TokenSelector, SwapSettings } from "@/components/swap";
import { useAccount } from "wagmi";
import { ArrowUpDown, Settings, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { useSwap } from "@/hooks/use-swap";
import { useTokenBalance } from "@/hooks/use-token-balance";
import { useWalletModal } from "@/components/wallet";

export default function SwapPage() {
  const { isConnected, address } = useAccount();
  const { openModal } = useWalletModal();

  const {
    fromToken,
    toToken,
    setFromToken,
    setToToken,
    swapTokens,
    quote,
    status,
    error,
    txHash,
    isLoading,
    getQuote,
    executeSwap,
    clearError,
    reset,
  } = useSwap();

  const [showFromSelector, setShowFromSelector] = useState(false);
  const [showToSelector, setShowToSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fromAmount, setFromAmount] = useState("");

  const { formattedBalance: fromBalance } = useTokenBalance({
    token: fromToken,
    address,
    watch: true,
  });

  const { formattedBalance: toBalance } = useTokenBalance({
    token: toToken,
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
  }, [fromAmount, fromToken, toToken, getQuote]);

  // #region agent log
  useEffect(() => {
    if (!quote) return;
    fetch('http://127.0.0.1:7881/ingest/40f9def0-dd00-4c01-a49d-85ca6d337bf7', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '485dad' },
      body: JSON.stringify({
        sessionId: '485dad',
        hypothesisId: 'PRICE1',
        location: 'swap/page.tsx:quote',
        message: 'swap quote computed',
        data: {
          from: fromToken.symbol,
          to: toToken.symbol,
          fromAmount,
          toAmount: quote.toAmount,
          exchangeRate: quote.exchangeRate,
          estimatedGas: quote.estimatedGas,
          priceImpact: quote.priceImpact,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }, [quote, fromToken.symbol, toToken.symbol, fromAmount]);
  // #endregion

  const handleFlipTokens = useCallback(() => {
    swapTokens();
    setFromAmount("");
    reset();
  }, [swapTokens, reset]);

  const handleMaxClick = useCallback(() => {
    setFromAmount(fromBalance);
    getQuote(fromBalance);
  }, [fromBalance, getQuote]);

  const handleSwap = useCallback(async () => {
    if (!isConnected) {
      openModal();
      return;
    }
    if (!fromAmount || parseFloat(fromAmount) === 0) return;
    await executeSwap(fromAmount);
  }, [isConnected, openModal, fromAmount, executeSwap]);

  const getButtonText = () => {
    if (!isConnected) return "Connect Wallet";
    if (status === "fetching_quote") return "Fetching Quote...";
    if (status === "confirming") return "Confirm in Wallet...";
    if (status === "pending") return "Transaction Pending...";
    if (status === "success") return "Swap Complete!";
    if (status === "error") return error?.message ?? "Swap Failed";
    if (!fromAmount || parseFloat(fromAmount) === 0) return "Enter an amount";
    if (parseFloat(fromAmount) > parseFloat(fromBalance))
      return "Insufficient Balance";
    return `Swap ${fromToken.symbol} → ${toToken.symbol}`;
  };

  const isButtonDisabled =
    !isConnected ||
    !fromAmount ||
    parseFloat(fromAmount) === 0 ||
    parseFloat(fromAmount) > parseFloat(fromBalance) ||
    isLoading ||
    status === "pending" ||
    status === "success";

  const handleCloseSuccess = () => {
    reset();
    setFromAmount("");
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        <div className="mx-auto max-w-lg px-4 py-12">
          <div className="mb-8 text-center">
            <h1 className="text-gradient mb-2 text-4xl font-bold">
              Swap Tokens
            </h1>
            <p className="text-muted-foreground">
              Exchange tokens instantly on Arc Network
            </p>
          </div>

          <div className="mb-4 flex items-center justify-end gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-secondary transition-colors"
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>

          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <TokenBox
                label="You Pay"
                token={fromToken}
                amount={fromAmount}
                balance={fromBalance}
                onAmountChange={(v) => {
                  setFromAmount(v);
                  clearError();
                }}
                onSelect={() => setShowFromSelector(true)}
                onMaxClick={handleMaxClick}
              />

              <div className="relative z-10 my-2 flex justify-center">
                <button
                  onClick={handleFlipTokens}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background transition-all hover:border-primary hover:bg-primary/10"
                >
                  <ArrowUpDown className="h-5 w-5 text-primary" />
                </button>
              </div>

              <TokenBox
                label="You Receive"
                token={toToken}
                amount={quote?.toAmount ?? ""}
                balance={toBalance}
                onAmountChange={() => {}}
                onSelect={() => setShowToSelector(true)}
                readOnly
              />

              {quote && status !== "success" && (
                <div className="mt-4 rounded-lg border border-border bg-secondary/50 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rate</span>
                    <span>
                      1 {fromToken.symbol} = {quote.exchangeRate.toFixed(4)}{" "}
                      {toToken.symbol}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Min. Received
                    </span>
                    <span>
                      {quote.minimumReceived} {toToken.symbol}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Price Impact</span>
                    <span
                      className={
                        quote.priceImpact > 1 ? "text-yellow-500" : ""
                      }
                    >
                      {quote.priceImpact < 0.01 ? "<0.01" : quote.priceImpact}%
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Est. Gas</span>
                    <span>~${quote.estimatedGas}</span>
                  </div>
                </div>
              )}

              {status === "error" && error && (
                <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <XCircle className="h-4 w-4" />
                    <span>{error.message}</span>
                  </div>
                </div>
              )}

              {status === "success" && txHash && (
                <div className="mt-4 rounded-lg border border-green-500/50 bg-green-500/10 p-4">
                  <div className="flex items-center gap-2 text-sm text-green-500">
                    <CheckCircle className="h-4 w-4" />
                    <span>Swap successful!</span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Tx: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                  </div>
                  <Button
                    onClick={handleCloseSuccess}
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-7 text-xs"
                  >
                    New Swap
                  </Button>
                </div>
              )}

              {status === "pending" && (
                <div className="mt-4 rounded-lg border border-primary/50 bg-primary/10 p-4">
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Waiting for confirmation...</span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleSwap}
                className="mt-4 w-full"
                size="lg"
                disabled={isButtonDisabled}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {getButtonText()}
              </Button>
            </CardContent>
          </Card>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Powered by Circle App Kit on Arc Network
          </p>
        </div>
      </main>

      <TokenSelector
        isOpen={showFromSelector}
        onClose={() => setShowFromSelector(false)}
        onSelect={(token) => {
          if (token.symbol === toToken.symbol) {
            swapTokens();
            setFromAmount("");
            reset();
          } else {
            setFromToken(token);
            setFromAmount("");
            reset();
          }
          setShowFromSelector(false);
        }}
        excludeToken={toToken}
      />

      <TokenSelector
        isOpen={showToSelector}
        onClose={() => setShowToSelector(false)}
        onSelect={(token) => {
          if (token.symbol === fromToken.symbol) {
            swapTokens();
            setFromAmount("");
            reset();
          } else {
            setToToken(token);
            setFromAmount("");
            reset();
          }
          setShowToSelector(false);
        }}
        excludeToken={fromToken}
      />

      <SwapSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}
