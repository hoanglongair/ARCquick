"use client";

import Link from "next/link";
import { useAccount, useDisconnect } from "wagmi";
import { formatAddress } from "@/lib/utils";
import { Button } from "@/components/ui";
import { WalletModal, NetworkSwitcher } from "@/components/wallet";
import { useState } from "react";
import { useNavScrolled } from "@/components/effects";

export function Navbar() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const isScrolled = useNavScrolled();

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
          isScrolled
            ? "border-border/80 bg-background/85 backdrop-blur-xl"
            : "border-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="logo-dot" />
            <span className="text-lg font-extrabold tracking-tight">ARCquick</span>
          </Link>

          {/* Nav Links */}
          <div className="nav-links-desktop hidden items-center gap-9">
            <Link
              href="/swap"
              className="nav-link text-xs font-medium uppercase tracking-widest"
              style={{ color: "rgba(240,244,248,0.45)" }}
            >
              SWAP
            </Link>
            <Link
              href="/protocol"
              className="nav-link text-xs font-medium uppercase tracking-widest"
              style={{ color: "rgba(240,244,248,0.45)" }}
            >
              PROTOCOL
            </Link>
            <Link
              href="/assets"
              className="nav-link text-xs font-medium uppercase tracking-widest"
              style={{ color: "rgba(240,244,248,0.45)" }}
            >
              ASSETS
            </Link>
            <Link
              href="/guide"
              className="nav-link text-xs font-medium uppercase tracking-widest"
              style={{ color: "rgba(240,244,248,0.45)" }}
            >
              GUIDE
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Network Switcher */}
            <NetworkSwitcher />

            {/* Connect Button */}
            {isConnected ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all hover:bg-white/5"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    borderColor: "rgba(255,255,255,0.15)",
                  }}
                >
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  {formatAddress(address || "")}
                </button>

                {showDropdown && (
                  <div className="absolute right-0 top-12 z-50 w-48 rounded-xl border p-1 shadow-xl" style={{ background: "hsl(240, 15%, 6%)", borderColor: "rgba(255,255,255,0.15)" }}>
                    <button
                      onClick={() => disconnect()}
                      className="flex w-full items-center px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-400/10"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button onClick={() => setShowModal(true)} className="rounded-full px-6 font-bold">
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </nav>

      <WalletModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
