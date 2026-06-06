"use client";

import { useConnect } from "wagmi";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WALLET_ICONS: Record<string, React.ReactNode> = {
  MetaMask: (
    <svg viewBox="0 0 35 33" className="h-6 w-6" fill="none">
      <path
        d="M32.9 1L19.4 10.8l2.5-5.9L32.9 1z"
        fill="#E2761B"
        stroke="#E2761B"
        strokeWidth="0.5"
      />
      <path
        d="M2.1 1l13.4 9.9-2.4-6L2.1 1zM28.2 23.5l-3.6 5.5 7.7 2.1 2.2-7.5-6.3-.1zM.5 23.6l2.2 7.5 7.7-2.1-3.6-5.5-6.3.1z"
        fill="#E4761B"
        stroke="#E4761B"
        strokeWidth="0.5"
      />
      <path
        d="M10 14.3L7.9 17.6l6.9.3-.2-7.4-4.6 3.8zM25 14.3l-4.7-3.9-.2 7.5 6.9-.3L25 14.3zM10.4 29l4.2-2-3.6-2.8-.6 4.8zM20.4 27l4.2 2-.6-4.8-3.6 2.8z"
        fill="#E4761B"
        stroke="#E4761B"
        strokeWidth="0.5"
      />
    </svg>
  ),
  "WalletConnect": (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="white">
      <path d="M4.9 7.5C8.8 3.6 15.2 3.6 19.1 7.5L19.6 8c.2.2.2.5 0 .7l-1.8 1.8c-.1.1-.3.1-.4 0L16.8 10c-2.7-2.7-7-2.7-9.7 0l-.7.7c-.1.1-.3.1-.4 0L4.2 8.8c-.2-.2-.2-.5 0-.7l.7-.6zM22.4 10.9l1.6 1.6c.2.2.2.5 0 .7l-7.2 7.2c-.2.2-.5.2-.7 0L11.7 16c-.1-.1-.2-.1-.3 0l-4.4 4.4c-.2.2-.5.2-.7 0L.3 13.2c-.2-.2-.2-.5 0-.7l1.6-1.6c.2-.2.5-.2.7 0l4.4 4.4c.1.1.2.1.3 0l4.4-4.4c.2-.2.5-.2.7 0l4.4 4.4c.1.1.2.1.3 0l4.4-4.4c.2-.2.5-.2.7 0z" />
    </svg>
  ),
  "Coinbase Wallet": (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="white">
      <rect x="4" y="4" width="16" height="16" rx="8" fill="#1652f0" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="2.5" fill="#1652f0" />
    </svg>
  ),
};

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connectors, connect, isPending, variables } = useConnect();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm animate-fade-in rounded-2xl border border-border bg-popover p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2">
          {connectors.map((connector) => {
            const connectorName =
              connector.name === "injected" ? "MetaMask" : connector.name;
            const icon = WALLET_ICONS[connectorName] || WALLET_ICONS.MetaMask;

            return (
              <button
                key={connector.uid}
                onClick={() => connect({ connector })}
                disabled={isPending}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border border-border bg-secondary/50 p-4 transition-all hover:border-primary/50 hover:bg-secondary",
                  isPending && variables?.connector === connector
                    ? "opacity-50"
                    : ""
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                  {icon}
                </div>
                <div className="text-left">
                  <div className="font-medium">{connectorName}</div>
                  <div className="text-xs text-muted-foreground">
                    {connectorName === "MetaMask"
                      ? "Connect using browser wallet"
                      : connectorName === "WalletConnect"
                        ? "Scan with mobile wallet"
                        : "Use Coinbase Wallet app"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          By connecting, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
