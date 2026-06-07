# ARCHITECTURE.md

## Purpose

ARCHITECTURE.md mô tả cấu trúc kỹ thuật tổng thể của hệ thống ARCquick.

## Technology Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + CSS variables
- **State:** Zustand (localStorage persist) + React Query
- **Web3:** wagmi v2 + viem
- **Auth:** Supabase Auth (@supabase/supabase-js)
- **Charts:** Pure SVG (no external chart library)

### Blockchain / Web3
- **Chain:** Arc Network (EVM-compatible)
- **Swap/Bridge:** @circle-app/app-kit (App Kit SDK)
- **Cross-Chain:** Circle CCTP
- **Wallet:** MetaMask, WalletConnect, Coinbase Wallet

### External Services
- **Supabase:** Email/password authentication (optional)
- **Chain Explorers:** Arcscan, Etherscan, Polygonscan, Arbiscan

## Module Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── swap/page.tsx
│   ├── bridge/page.tsx
│   ├── send/page.tsx
│   ├── transactions/page.tsx
│   └── dashboard/page.tsx
├── components/
│   ├── ui/                   # Base UI components (Button, Input, Card, Badge, etc.)
│   ├── layout/               # Navbar, Footer
│   ├── wallet/               # WalletModal, NetworkSwitcher, ConnectButton
│   ├── swap/                  # SwapPage, TokenBox, TokenSelector, SwapSettings
│   ├── bridge/                # BridgePage, ChainSelector
│   ├── send/                  # SendPage, AddressInput
│   ├── transaction/           # TransactionPage, TransactionList, TransactionToast
│   ├── dashboard/             # AnalyticsDashboard, StatsCard
│   ├── auth/                  # AuthModal
│   └── effects/               # Cursor effect, Toast system, Background
├── hooks/                     # Custom React hooks
│   ├── use-swap.ts
│   ├── use-bridge.ts
│   ├── use-send.ts
│   ├── use-token-balance.ts
│   ├── use-transaction-history.ts
│   ├── use-network-preferences.ts
│   └── index.ts
├── stores/                    # Zustand stores
│   └── app-store.ts           # Transactions, slippage, gas, deadline, theme
├── lib/
│   ├── wagmi/                 # wagmi config, chains
│   ├── app-kit/               # AppKit SDK wrapper
│   ├── supabase/              # Supabase client, AuthProvider
│   ├── network/               # Chain features config
│   └── utils.ts               # Utility functions (formatUSD, formatAddress)
├── types/                     # Shared TypeScript types
└── styles/                    # Global CSS, Tailwind config
```

## Layer Responsibilities

### Pages (`src/app/`)
- Route handlers / page components
- Layout composition (Navbar + page content)
- Minimal logic, delegate to hooks

### Components (`src/components/`)
- UI rendering and user interaction
- Receive data and callbacks via props
- Use hooks for state/logic

### Hooks (`src/hooks/`)
- Business logic and stateful operations
- Interface to wagmi, AppKit SDK, Zustand
- Return typed data and handlers

### Stores (`src/stores/`)
- Global app state via Zustand
- Persisted to localStorage via `persist` middleware
- No side effects or API calls

### Lib (`src/lib/`)
- Configuration and setup (wagmi, AppKit, Supabase)
- Pure utility functions
- Chain/network definitions

## Data Flow

```
User Action
    ↓
Page Component (src/app/)
    ↓
Custom Hook (src/hooks/) ← → External APIs (wagmi, AppKit, Supabase)
    ↓
Zustand Store (src/stores/) ← → localStorage (persist)
    ↓
UI Components (src/components/) → Render updated state
```

## Key Design Decisions

- **Client Components first:** Most components are "use client" due to wagmi/hooks requirements
- **No server-side data fetching** for blockchain data (all client-side via hooks)
- **Local-first transactions:** Transaction history stored in Zustand/localStorage (backend optional)
- **Optional auth:** Supabase auth is optional; core features work without account
- **Chain-agnostic UI:** Per-chain token/feature configs in `src/lib/network/`
