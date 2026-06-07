"use client";

import { useAccount } from "wagmi";
import { Navbar } from "@/components/layout";
import { Button } from "@/components/ui";
import { QRCode } from "@/components/send/qr-code";
import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function ReceivePage() {
  const { address, isConnected } = useAccount();
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        <div className="mx-auto max-w-md px-4 py-12">
          <h1 className="text-gradient mb-2 text-4xl font-bold">Receive</h1>
          <p className="mb-8 text-muted-foreground">
            Receive tokens by sharing your wallet address
          </p>

          {!isConnected ? (
            <div className="rounded-xl border bg-card p-8 text-center">
              <p className="text-muted-foreground">Connect wallet to get your address</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-xl border bg-card p-6">
                <div className="mb-4 flex justify-center">
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="rounded-lg border border-border bg-secondary/50 px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
                  >
                    {showQR ? "Hide QR" : "Show QR"} Code
                  </button>
                </div>

                {showQR && (
                  <div className="mb-4 flex justify-center">
                    <QRCode value={address!} size={200} />
                  </div>
                )}

                <div className="rounded-lg border border-border bg-secondary/30 p-3">
                  <p className="mb-2 text-xs text-muted-foreground">Your Wallet Address</p>
                  <div className="flex items-center gap-2">
                    <p className="flex-1 truncate font-mono text-sm">{address}</p>
                    <button
                      onClick={handleCopy}
                      className="shrink-0 rounded-lg p-2 transition-colors hover:bg-secondary"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                <p className="text-sm text-yellow-500">Only send ARC-compatible tokens to this address</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Sending other tokens may result in permanent loss
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
