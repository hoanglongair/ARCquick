"use client";

import { useState, useCallback, useEffect } from "react";
import { Navbar } from "@/components/layout";
import { Card, CardContent, Button, Input } from "@/components/ui";
import { AddressInput } from "./address-input";
import { TokenSelector } from "@/components/swap";
import { useAccount } from "wagmi";
import { Loader2, CheckCircle, XCircle, Send } from "lucide-react";
import { useSend } from "@/hooks/use-send";
import { useTokenBalance, isNativeToken } from "@/hooks/use-token-balance";
import { useWalletModal } from "@/components/wallet";
import type { Token } from "@/types";
import { formatUSD } from "@/lib/utils";

const DEFAULT_TOKEN: Token = {
  symbol: "ETH",
  address: "0x0000000000000000000000000000000000000000",
  decimals: 18,
  name: "Ethereum",
  icon: "\u039E",
  chainId: 421614,
  price: 2847.5,
};

const SENDABLE_TOKENS: Token[] = [
  {
    symbol: "ETH",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    name: "Ethereum",
    icon: "\u039E",
    chainId: 421614,
    price: 2847.5,
  },
  {
    symbol: "USDC",
    address: "0x036aBf8B88F8C4bDe3d5C2c7a6D7C8a8C9B0D1E",
    decimals: 6,
    name: "USD Coin",
    icon: "$",
    chainId: 421614,
    price: 1,
  },
];

export default function SendPage() {
  const { isConnected, address } = useAccount();
  const { openModal } = useWalletModal();

  const {
    recipient,
    setRecipient,
    amount,
    setAmount,
    memo,
    setMemo,
    token,
    setToken,
    status,
    error,
    txHash,
    isLoading,
    sendToken,
    clearError,
    reset,
  } = useSend();

  const [showTokenSelector, setShowTokenSelector] = useState(false);

  useEffect(() => {
    if (!token) {
      setToken(DEFAULT_TOKEN);
    }
  }, [token, setToken]);

  const selectedToken = token ?? DEFAULT_TOKEN;

  const { formattedBalance: balance } = useTokenBalance({
    token: selectedToken,
    address,
    watch: true,
  });

  const handleTokenSelect = useCallback(
    (t: Token) => {
      setToken(t);
      setShowTokenSelector(false);
    },
    [setToken]
  );

  const handleSend = useCallback(async () => {
    if (!isConnected) {
      openModal();
      return;
    }
    await sendToken(balance);
  }, [isConnected, openModal, sendToken, balance]);

  const getButtonText = () => {
    if (!isConnected) return "Connect Wallet";
    if (status === "confirming") return "Confirm in Wallet...";
    if (status === "pending") return "Transaction Pending...";
    if (status === "success") return "Send Complete!";
    if (status === "error") return error?.message ?? "Send Failed";
    if (!recipient) return "Enter Recipient Address";
    if (!amount || parseFloat(amount) === 0) return "Enter an Amount";
    if (parseFloat(amount) > parseFloat(balance))
      return "Insufficient Balance";
    return "Send";
  };

  const isButtonDisabled =
    !isConnected ||
    !recipient ||
    !amount ||
    parseFloat(amount) === 0 ||
    parseFloat(amount) > parseFloat(balance) ||
    isLoading ||
    status === "pending" ||
    status === "success";

  const handleCloseSuccess = () => {
    reset();
  };

  const getTokenGradient = (sym: string) => {
    if (sym === "USDC") return "linear-gradient(135deg, #2775ca, #5badff)";
    if (sym === "EURC") return "linear-gradient(135deg, #1e3a8a, #3b82f6)";
    return "linear-gradient(135deg, #627eea, #a9b3ff)";
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        <div className="mx-auto max-w-lg px-4 py-12">
          <div className="mb-8 text-center">
            <h1 className="text-gradient mb-2 text-4xl font-bold">Send</h1>
            <p className="text-muted-foreground">
              Transfer tokens to any address
            </p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-5">
              <AddressInput
                value={recipient}
                onChange={(v) => {
                  setRecipient(v);
                  clearError();
                }}
                label="Recipient Address"
                placeholder="0x..."
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-muted-foreground">
                  Token
                </label>
                <button
                  onClick={() => setShowTokenSelector(true)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
                    style={{
                      background: getTokenGradient(selectedToken.symbol),
                      color: "white",
                    }}
                  >
                    {selectedToken.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">{selectedToken.symbol}</div>
                    <div className="text-xs text-muted-foreground">
                      {selectedToken.name}
                    </div>
                  </div>
                  <span className="text-muted-foreground">&#9662;</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">
                    Amount
                  </label>
                  <span className="text-xs text-muted-foreground">
                    Balance: {balance} {selectedToken.symbol}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^\d*\.?\d*$/.test(v)) {
                        setAmount(v);
                        clearError();
                      }
                    }}
                    placeholder="0.0"
                    className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-4 text-2xl font-semibold outline-none placeholder:text-muted-foreground focus:border-primary"
                  />
                  <button
                    onClick={() => setAmount(balance)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
                  >
                    MAX
                  </button>
                </div>
                {amount && parseFloat(amount) > 0 && (
                  <p className="text-right text-sm text-muted-foreground">
                    &#8776;{" "}
                    {formatUSD(parseFloat(amount) * (selectedToken.price ?? 0))}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-muted-foreground">
                  Memo / Note{" "}
                  <span className="text-xs text-muted-foreground">(optional)</span>
                </label>
                <Input
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="Add a note for this transfer"
                  maxLength={140}
                />
                <p className="text-right text-xs text-muted-foreground">
                  {memo.length}/140
                </p>
              </div>

              {status === "error" && error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <XCircle className="h-4 w-4" />
                    <span>{error.message}</span>
                  </div>
                </div>
              )}

              {status === "success" && txHash && (
                <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-4">
                  <div className="flex items-center gap-2 text-sm text-green-500">
                    <CheckCircle className="h-4 w-4" />
                    <span>Transfer complete!</span>
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
                    New Transfer
                  </Button>
                </div>
              )}

              {status === "pending" && (
                <div className="rounded-lg border border-primary/50 bg-primary/10 p-4">
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Waiting for confirmation...</span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleSend}
                className="w-full"
                size="lg"
                disabled={isButtonDisabled}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isConnected ? (
                  "Connect Wallet"
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {getButtonText()}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Powered by Arc Network
          </p>
        </div>
      </main>

      <TokenSelector
        isOpen={showTokenSelector}
        onClose={() => setShowTokenSelector(false)}
        onSelect={handleTokenSelect}
      />
    </>
  );
}
