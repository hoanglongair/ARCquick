"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout";
import { Button } from "@/components/ui";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, Zap, Shield, Route, Globe, Droplets, Key } from "lucide-react";

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const duration = 1800;
            const startTime = performance.now();
            const isFloat = target < 10;

            const tick = (currentTime: number) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const ease = 1 - Math.pow(1 - progress, 3);
              const val = target * ease;
              setValue(isFloat ? parseFloat(val.toFixed(2)) : Math.round(val));
              if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return <div ref={ref}>{value}{suffix}</div>;
}

const features = [
  {
    icon: Zap,
    title: "Instant Settlement",
    desc: "Sub-second finality on all supported testnets. No waiting, no uncertainty.",
  },
  {
    icon: Shield,
    title: "MEV Protected",
    desc: "Advanced MEV-shield routing ensures your transactions are protected.",
  },
  {
    icon: Route,
    title: "Smart Routing",
    desc: "Pathfinder algorithm splits orders across multiple liquidity pools.",
  },
  {
    icon: Globe,
    title: "Cross-Chain",
    desc: "Seamlessly swap tokens across multiple testnets in a single atomic transaction.",
  },
  {
    icon: Droplets,
    title: "Deep Liquidity",
    desc: "Aggregated liquidity from multiple AMM sources ensures minimal slippage.",
  },
  {
    icon: Key,
    title: "Non-Custodial",
    desc: "Your keys, your tokens, always. ARCquick never holds your assets.",
  },
];

const tokens = [
  { symbol: "ETH", name: "Ethereum", price: "$2,847", change: "+2.34%", up: true },
  { symbol: "USDC", name: "USD Coin", price: "$1.00", change: "+0.01%", up: true },
  { symbol: "LINK", name: "Chainlink", price: "$14.72", change: "+1.89%", up: true },
  { symbol: "MATIC", name: "Polygon", price: "$0.847", change: "-0.72%", up: false },
  { symbol: "UNI", name: "Uniswap", price: "$7.34", change: "+4.12%", up: true },
  { symbol: "ARB", name: "Arbitrum", price: "$1.14", change: "+3.56%", up: true },
  { symbol: "WBTC", name: "Wrapped Bitcoin", price: "$42,180", change: "-1.23%", up: false },
  { symbol: "AAVE", name: "Aave Protocol", price: "$94.50", change: "+0.98%", up: true },
];

const steps = [
  {
    num: "01",
    prog: 100,
    title: "Connect Wallet",
    desc: "Link MetaMask, WalletConnect, or any EVM wallet with a single click.",
  },
  {
    num: "02",
    prog: 75,
    title: "Select Network",
    desc: "Choose your testnet: Arc Sepolia, or other EVM chains—switch anytime.",
  },
  {
    num: "03",
    prog: 50,
    title: "Choose Tokens",
    desc: "Pick your input and output tokens. Preview real-time rates instantly.",
  },
  {
    num: "04",
    prog: 25,
    title: "Confirm Swap",
    desc: "Approve the transaction in your wallet. Done—tokens arrive in seconds.",
  },
];

export default function HomePage() {
  const revealsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.15 }
    );
    reveals.forEach((r) => observer.observe(r));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16">
        {/* Glow Lines */}
        <div className="glow-line" style={{ top: "30%", left: 0 }} />
        <div className="glow-line" style={{ top: "65%", right: 0, transform: "rotate(180deg)" }} />

        {/* Badge */}
        <div
          className="mb-8 flex items-center gap-2 rounded-full border px-4 py-2 animate-fade-up"
          style={{
            background: "rgba(255,255,255,0.06)",
            borderColor: "rgba(255,255,255,0.15)",
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "hsl(152, 100%, 50%)", animation: "pulse-dot 1.5s ease-in-out infinite" }} />
          <span
            className="text-xs font-medium uppercase tracking-widest"
            style={{ color: "hsl(186, 100%, 50%)" }}
          >
            Live on Sepolia Testnet
          </span>
        </div>

        {/* Title */}
        <h1
          className="mb-6 text-center text-5xl md:text-7xl lg:text-8xl font-extrabold leading-none tracking-tighter animate-fade-up"
          style={{ letterSpacing: "-3px" }}
        >
          <span className="block">Swap</span>
          <span
            className="block text-shimmer"
            style={{ animationDelay: "0.1s" }}
          >
            Anything.
          </span>
          <span className="block">Anywhere.</span>
        </h1>

        {/* Subtitle */}
        <p
          className="mb-8 max-w-xl text-center text-lg animate-fade-up"
          style={{ color: "rgba(240,244,248,0.45)", animationDelay: "0.2s" }}
        >
          The next-generation decentralized exchange for testnet tokens.
          Lightning-fast swaps, deep liquidity, and zero compromises.
        </p>

        {/* CTAs */}
        <div className="mb-16 flex flex-wrap items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <Link href="/swap">
            <Button size="lg" className="text-base px-10 py-4 rounded-full font-bold shadow-lg">
              Launch App
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="text-base px-10 py-4 rounded-full font-semibold">
            View on GitHub
          </Button>
        </div>

        {/* Stats */}
        <div
          className="mb-16 grid grid-cols-2 gap-12 md:grid-cols-4 animate-fade-up"
          style={{ animationDelay: "0.4s" }}
        >
          {[
            { value: 2.4, suffix: "B", label: "Billion Volume" },
            { value: 180, suffix: "+", label: "Tokens Listed" },
            { value: 48, suffix: "K", label: "K Active Users" },
            { value: 0.05, suffix: "%", label: "Base Fee" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-bold font-mono" style={{ color: "hsl(186, 100%, 50%)" }}>
                <AnimatedNumber target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="mt-1 text-xs uppercase tracking-widest" style={{ color: "rgba(240,244,248,0.45)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Scroll Hint */}
        <div
          className="absolute bottom-8 flex flex-col items-center gap-2 animate-fade-up"
          style={{ animationDelay: "0.8s" }}
        >
          <span className="text-xs uppercase tracking-widest" style={{ color: "rgba(240,244,248,0.15)" }}>
            Scroll
          </span>
          <div
            className="h-10 w-px"
            style={{
              background: "linear-gradient(to bottom, hsl(186, 100%, 50%), transparent)",
              animation: "scroll-anim 2s ease-in-out infinite",
            }}
          />
        </div>
      </section>

      {/* Ticker */}
      <div
        className="border-y overflow-hidden py-4 relative z-10"
        style={{
          borderColor: "rgba(255,255,255,0.08)",
          background: "linear-gradient(to right, hsl(240, 20%, 4%) 0%, transparent 8%, transparent 92%, hsl(240, 20%, 4%) 100%)",
        }}
      >
        <div className="flex animate-ticker whitespace-nowrap">
          {[...tokens, ...tokens].map((token, i) => (
            <span key={i} className="mx-8 flex items-center gap-2 font-mono text-sm">
              <span className="font-medium">{token.symbol}/USDC</span>
              <span className={token.up ? "text-green-400" : "text-red-400"}>
                {token.change}
              </span>
              <span style={{ color: "rgba(240,244,248,0.45)" }}>{token.price}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Swap Section */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mt-16">
          <div className="reveal">
            <div
              className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "hsl(186, 100%, 50%)" }}
            >
              <span className="h-6 w-px" style={{ background: "hsl(186, 100%, 50%)" }} />
              Core Protocol
            </div>
            <h2 className="mb-4 text-4xl lg:text-5xl font-extrabold tracking-tight">
              Swap tokens<br />in seconds.
            </h2>
            <p className="mb-6 max-w-md" style={{ color: "rgba(240,244,248,0.45)" }}>
              Connect any EVM-compatible wallet and swap across Arc Sepolia and other testnets with best-price routing.
            </p>

            {/* Network badges */}
            <div className="flex flex-wrap gap-2">
              {[
                { name: "Sepolia", active: true },
                { name: "Mumbai", color: "#8247e5" },
                { name: "Goerli", color: "#f59e0b" },
                { name: "Arbitrum", color: "#12aaff" },
              ].map((net) => (
                <button
                  key={net.name}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-all hover:border-white/30"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${net.active ? "hsl(186, 100%, 50%)" : "rgba(255,255,255,0.08)"}`,
                    color: net.active ? "hsl(186, 100%, 50%)" : "inherit",
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: net.color || "#10b981" }}
                  />
                  {net.name}
                </button>
              ))}
            </div>
          </div>

          {/* Swap Card */}
          <div className="reveal rounded-2xl border p-6 relative overflow-hidden transition-colors hover:border-white/20" style={{ animationDelay: "0.1s", background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
            {/* Gradient overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at top, rgba(0,229,255,0.04) 0%, transparent 60%)",
              }}
            />

            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold">Token Swap</h3>
              <button
                className="h-9 w-9 rounded-xl flex items-center justify-center transition-transform hover:rotate-60"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" style={{ stroke: "rgba(240,244,248,0.45)", fill: "none", strokeWidth: 1.5 }}>
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
              </button>
            </div>

            {/* From Token */}
            <div
              className="rounded-xl border p-4 mb-2 transition-colors focus-within:border-cyan-400"
              style={{ background: "hsl(240, 15%, 6%)", borderColor: "rgba(255,255,255,0.08)" }}
            >
              <div className="mb-3 text-xs uppercase tracking-wider" style={{ color: "rgba(240,244,248,0.45)" }}>
                You Pay
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="flex items-center gap-2 rounded-full px-3 py-1.5 transition-all hover:bg-white/5"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <span className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, #627eea, #a9b3ff)" }}>
                    Ξ
                  </span>
                  <span className="font-bold text-sm">ETH</span>
                  <span style={{ color: "rgba(240,244,248,0.45)" }}>▾</span>
                </button>
                <input
                  type="text"
                  placeholder="0.0"
                  className="flex-1 bg-transparent text-right text-2xl font-medium outline-none font-mono"
                  style={{ color: "hsl(0, 0%, 94%)" }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs font-mono" style={{ color: "rgba(240,244,248,0.45)" }}>
                <span>Balance: 2.4847 ETH</span>
                <span>≈ $0.00</span>
              </div>
            </div>

            {/* Swap Arrow */}
            <div className="flex justify-center my-1">
              <button
                className="h-10 w-10 rounded-xl flex items-center justify-center transition-all hover:bg-cyan-400 hover:border-cyan-400 hover:rotate-180"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ stroke: "rgba(240,244,248,0.45)", fill: "none", strokeWidth: 2 }}>
                  <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* To Token */}
            <div
              className="rounded-xl border p-4 mb-4"
              style={{ background: "hsl(240, 15%, 6%)", borderColor: "rgba(255,255,255,0.08)" }}
            >
              <div className="mb-3 text-xs uppercase tracking-wider" style={{ color: "rgba(240,244,248,0.45)" }}>
                You Receive
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="flex items-center gap-2 rounded-full px-3 py-1.5 transition-all hover:bg-white/5"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <span className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, #2775ca, #5badff)" }}>
                    $
                  </span>
                  <span className="font-bold text-sm">USDC</span>
                  <span style={{ color: "rgba(240,244,248,0.45)" }}>▾</span>
                </button>
                <input
                  type="text"
                  placeholder="0.0"
                  readOnly
                  className="flex-1 bg-transparent text-right text-2xl font-medium outline-none font-mono"
                  style={{ color: "hsl(0, 0%, 94%)" }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs font-mono" style={{ color: "rgba(240,244,248,0.45)" }}>
                <span>Balance: 1,240.00 USDC</span>
                <span>≈ $0.00</span>
              </div>
            </div>

            {/* Route Info */}
            <div
              className="rounded-xl border p-3 mb-4 text-xs font-mono"
              style={{ background: "hsl(240, 15%, 6%)", borderColor: "rgba(255,255,255,0.08)" }}
            >
              <div className="flex justify-between mb-1.5">
                <span style={{ color: "rgba(240,244,248,0.45)" }}>Rate</span>
                <span>1 ETH = 2,847.50 USDC</span>
              </div>
              <div className="flex justify-between mb-1.5">
                <span style={{ color: "rgba(240,244,248,0.45)" }}>Price Impact</span>
                <span style={{ color: "hsl(152, 100%, 50%)" }}>&lt; 0.01%</span>
              </div>
              <div className="flex justify-between mb-1.5">
                <span style={{ color: "rgba(240,244,248,0.45)" }}>Min Received</span>
                <span>0 USDC</span>
              </div>
              <div className="h-px my-2" style={{ background: "rgba(255,255,255,0.08)" }} />
              <div className="flex justify-between mb-1.5">
                <span style={{ color: "rgba(240,244,248,0.45)" }}>Route</span>
                <div className="flex items-center gap-1">
                  <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ background: "rgba(255,255,255,0.06)" }}>ETH</span>
                  <span style={{ color: "rgba(240,244,248,0.45)" }}>→</span>
                  <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ background: "rgba(255,255,255,0.06)" }}>USDC</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "rgba(240,244,248,0.45)" }}>Est. Gas</span>
                <span>~$0.08</span>
              </div>
            </div>

            {/* Swap Button */}
            <Link href="/swap">
              <button
                className="w-full rounded-xl py-4 font-bold text-base transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  background: "linear-gradient(135deg, hsl(186, 100%, 50%) 0%, #006aff 100%)",
                  color: "#000",
                  boxShadow: "0 4px 32px rgba(0,229,255,0.2)",
                }}
              >
                Connect Wallet to Swap
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl text-center mb-16 reveal">
          <div
            className="mb-4 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "hsl(186, 100%, 50%)" }}
          >
            Why ARCquick
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">
            Built for the next <span className="text-shimmer">generation</span> of DeFi.
          </h2>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div
              key={i}
              className="reveal group rounded-2xl border p-8 transition-all hover:-translate-y-1 hover:border-white/20"
              style={{
                animationDelay: `${i * 0.1}s`,
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <div
                className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                <feature.icon className="h-6 w-6" style={{ color: "hsl(186, 100%, 50%)" }} />
              </div>
              <h3 className="mb-2 text-lg font-bold">{feature.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(240,244,248,0.45)" }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Tokens Section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl mb-12 reveal">
          <div
            className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "hsl(186, 100%, 50%)" }}
          >
            Supported Assets
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trade <span className="text-shimmer">180+</span> testnet tokens.
          </h2>
          <p style={{ color: "rgba(240,244,248,0.45)" }}>
            All major ERC-20 tokens available on supported testnets.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tokens.map((token, i) => (
            <div
              key={i}
              className="reveal flex items-center gap-4 rounded-xl border p-5 transition-all hover:-translate-y-0.5 hover:border-white/20"
              style={{
                animationDelay: `${i * 0.05}s`,
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{
                  background:
                    token.symbol === "ETH"
                      ? "linear-gradient(135deg, #627eea, #a9b3ff)"
                      : token.symbol === "USDC"
                        ? "linear-gradient(135deg, #2775ca, #5badff)"
                        : token.symbol === "LINK"
                          ? "linear-gradient(135deg, #2a5ada, #4d8fff)"
                          : token.symbol === "MATIC"
                            ? "linear-gradient(135deg, #8247e5, #ba97ff)"
                            : token.symbol === "UNI"
                              ? "linear-gradient(135deg, #ff007a, #ff6eba)"
                              : token.symbol === "ARB"
                                ? "linear-gradient(135deg, #12aaff, #62ceff)"
                                : token.symbol === "WBTC"
                                  ? "linear-gradient(135deg, #f7931a, #ffc26b)"
                                  : "linear-gradient(135deg, #b6509e, #2ebac6)",
                }}
              >
                {token.symbol.slice(0, 1)}
              </div>
              <div className="flex-1">
                <div className="font-bold">{token.symbol}</div>
                <div className="text-xs" style={{ color: "rgba(240,244,248,0.45)" }}>
                  {token.name}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-medium">{token.price}</div>
                <div className={`text-xs font-mono ${token.up ? "text-green-400" : "text-red-400"}`}>
                  {token.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-24 text-center">
        <div className="reveal mx-auto max-w-4xl mb-16">
          <div
            className="mb-4 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "hsl(186, 100%, 50%)" }}
          >
            Getting Started
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Swap in four steps.
          </h2>
          <p className="mx-auto" style={{ color: "rgba(240,244,248,0.45)" }}>
            No experience needed. Start trading testnet tokens in under a minute.
          </p>
        </div>

        <div
          className="reveal mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 relative"
          style={{ animationDelay: "0.1s" }}
        >
          {/* Connection line */}
          <div
            className="absolute top-8 left-[15%] right-[15%] h-px hidden lg:block"
            style={{
              background: "linear-gradient(to right, transparent, rgba(255,255,255,0.15), rgba(255,255,255,0.15), transparent)",
              zIndex: 0,
            }}
          />

          {steps.map((step, i) => (
            <div key={i} className="relative z-10">
              <div
                className="step-progress mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full text-xl font-extrabold font-mono"
                style={{
                  background: "hsl(240, 15%, 6%)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "hsl(186, 100%, 50%)",
                  "--prog": `${step.prog}%`,
                } as React.CSSProperties}
              >
                {step.num}
              </div>
              <h3 className="mb-2 font-bold">{step.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(240,244,248,0.45)" }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 text-center">
        <div className="reveal mx-auto max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="mb-8" style={{ color: "rgba(240,244,248,0.45)" }}>
            Connect your wallet and start swapping in seconds.
          </p>
          <Link href="/swap">
            <Button size="lg" className="text-lg px-8 py-5 rounded-full font-bold">
              Launch App
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="flex flex-col items-center justify-between gap-4 border-t px-6 py-8 md:flex-row"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-2">
          <div className="logo-dot" />
          <span className="font-bold">ARCquick</span>
          <span className="text-sm" style={{ color: "rgba(240,244,248,0.45)" }}>
            © 2025 For testnet use only.
          </span>
        </div>
        <div className="flex gap-6 text-sm" style={{ color: "rgba(240,244,248,0.45)" }}>
          <a href="#" className="transition-colors hover:text-white">Docs</a>
          <a href="#" className="transition-colors hover:text-white">GitHub</a>
          <a href="#" className="transition-colors hover:text-white">Discord</a>
        </div>
      </footer>
    </div>
  );
}
