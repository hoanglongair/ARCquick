"use client";

import Link from "next/link";
import { useAccount, useDisconnect } from "wagmi";
import { formatAddress } from "@/lib/utils";
import { Button } from "@/components/ui";
import { WalletModal, NetworkSwitcher } from "@/components/wallet";
import { AuthModal } from "@/components/auth";
import { useState } from "react";
import { useNavScrolled } from "@/components/effects";
import { useAuth } from "@/lib/supabase";
import { User, LogOut, Settings, UserCircle } from "lucide-react";

export function Navbar() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const isScrolled = useNavScrolled();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setShowUserDropdown(false);
  };

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
          <Link href="/" className="flex items-center gap-2">
            <div className="logo-dot" />
            <span className="text-lg font-extrabold tracking-tight">ARCquick</span>
          </Link>

          <div className="nav-links-desktop hidden items-center gap-9">
            <Link href="/swap" className="nav-link text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(240,244,248,0.45)" }}>
              SWAP
            </Link>
            <Link href="/bridge" className="nav-link text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(240,244,248,0.45)" }}>
              BRIDGE
            </Link>
            <Link href="/send" className="nav-link text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(240,244,248,0.45)" }}>
              SEND
            </Link>
            <Link href="/transactions" className="nav-link text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(240,244,248,0.45)" }}>
              TXS
            </Link>
            <Link href="/protocol" className="nav-link text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(240,244,248,0.45)" }}>
              PROTOCOL
            </Link>
            <Link href="/assets" className="nav-link text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(240,244,248,0.45)" }}>
              ASSETS
            </Link>
            <Link href="/guide" className="nav-link text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(240,244,248,0.45)" }}>
              GUIDE
            </Link>
            <Link href="/trading" className="nav-link text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(240,244,248,0.45)" }}>
              TRADING
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <NetworkSwitcher />

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border transition-all hover:bg-white/5"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    borderColor: "rgba(255,255,255,0.15)",
                  }}
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                </button>
                {showUserDropdown && (
                  <div
                    className="absolute right-0 top-12 z-50 w-56 rounded-xl border p-1 shadow-xl"
                    style={{ background: "hsl(240, 15%, 6%)", borderColor: "rgba(255,255,255,0.15)" }}
                  >
                    <div className="border-b border-border px-3 py-2">
                      <p className="text-sm font-medium truncate">{user.email}</p>
                      <p className="text-xs text-muted-foreground">Signed in</p>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-secondary transition-colors"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <UserCircle className="h-4 w-4" />
                      Profile
                    </Link>
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-secondary transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>
                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button
                onClick={() => setShowAuthModal(true)}
                variant="outline"
                size="sm"
                className="rounded-full px-4 text-xs"
              >
                <User className="mr-1.5 h-3.5 w-3.5" />
                Sign In
              </Button>
            )}

            {isConnected ? (
              <div className="relative">
                <button
                  onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                  className="flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all hover:bg-white/5"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    borderColor: "rgba(255,255,255,0.15)",
                  }}
                >
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  {formatAddress(address || "")}
                </button>
                {showWalletDropdown && (
                  <div
                    className="absolute right-0 top-12 z-50 w-48 rounded-xl border p-1 shadow-xl"
                    style={{ background: "hsl(240, 15%, 6%)", borderColor: "rgba(255,255,255,0.15)" }}
                  >
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
              <Button onClick={() => setShowWalletModal(true)} className="rounded-full px-6 font-bold">
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </nav>

      <WalletModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
