# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [2026-06-07] - v0.2.0

### Added

- **Phase 4: Security & Compliance**
  - Security store (`src/stores/security-store.ts`) with Zustand persist - whitelist, daily limits, simulation, anomaly detection
  - Address whitelisting: add/remove approved recipients, toggle per-feature, persistent across sessions
  - Daily limits: USD cap per token/chain, auto-reset at midnight, progress bar display, configurable limit
  - Transaction simulation (`src/hooks/use-transaction-simulation.ts`) - preview gas estimate, price impact, warnings before signing
  - Anomaly detection (`src/hooks/use-anomaly-detector.ts`) - rules: large tx (2x+ average), new recipient, unusual timing, rate limiting
  - Gas price alerts (`src/hooks/use-gas-alerts.ts`) - configurable gwei threshold (default 50), toast on high gas
  - `SecuritySettingsPanel` component (`src/components/security/security-settings-panel.tsx`) with 5 expandable sections
  - Security tab added to SwapSettings modal alongside Swap/Advanced/Alerts tabs
  - `useSend` hook updated: replaced fake `setTimeout` with real `useTransactionWatcher` chain monitoring

---

## [2026-06-07] - v0.1.7

### Added

- **Phase 3.4: Advanced Trading**
  - Advanced trading store (`src/stores/advanced-trading-store.ts`) with Zustand persist for limit + TWAP orders
  - Limit orders: buy/sell with target price, expiry (1-72h), auto-execution when price crosses threshold
  - `useLimitOrderChecker` hook polling every price update (30s) to check and execute pending limit orders
  - TWAP orders: split total amount into 2-12 tranches, configurable interval (15m-4h), auto-execution via `useTwapExecutor` (10s polling)
  - `AdvancedTradingPanel` component with Limit/TWAP/Routes tabs (`src/components/trading/advanced-trading-panel.tsx`)
  - `ActiveOrdersPanel` component showing live order cards with cancel/remove/history (`src/components/trading/active-orders-panel.tsx`)
  - `/trading` page at `src/app/trading/page.tsx` - full order management interface
  - Best price router (`src/lib/app-kit/router.ts`) comparing 5 routes: AppKit/CCTP, Uniswap V2, Uniswap V3, Curve, Balancer
  - `RoutesPanel` showing all route quotes with savings calculation vs worst route
  - Navbar updated with TRADING link
  - Order executors auto-enabled via `Providers` (`useLimitOrderChecker`, `useTwapExecutor`)

---

## [2026-06-07] - v0.1.6

### Added

- **Phase 3.3: Real-time Updates**
  - `usePriceFeed` hook (`src/hooks/use-price-feed.ts`) fetching from CoinGecko API with 30s auto-refresh, supports ETH/USDC/EURC/WETH/USDT/DAI/ARB/MATIC
  - `useTokenPrice` hook for individual token price queries
  - `usePriceAlertChecker` hook for auto-triggering alerts on price movements
  - Price alerts store (`src/stores/price-alert-store.ts`) with Zustand persist, supports above/below conditions, max 50 alerts
  - `PriceAlertPanel` component (`src/components/alerts/price-alert-panel.tsx`) with create/remove/reset/clear triggered alerts
  - Price alerts integrated into SwapSettings modal as "Alerts" tab
  - `useTransactionWatcher` hook (`src/hooks/use-transaction-watcher.ts`) for real on-chain tx confirmation monitoring via wagmi `useWaitForTransactionReceipt`

### Changed

- `useSwap` hook - replaced fake `setTimeout` with real on-chain tx status monitoring (`useTransactionWatcher`)
- `useBridge` hook - replaced fake `setTimeout` with real on-chain tx status monitoring (`useTransactionWatcher`)
- Toast now shows "Transaction confirmed on-chain!" or "Transaction failed" on chain confirmation/failure
- `Providers` component now includes `RealtimeListeners` for background price alert checking
- `src/hooks/index.ts` exports updated with new hooks

---

## [2026-06-07] - v0.1.5

### Added

- **Phase 3.1: Send Money Enhancements**
  - AddressBook store (`src/stores/address-book.ts`) with Zustand persist, add/edit/delete/search contacts (up to 50)
  - AddressBook component (`src/components/send/address-book.tsx`) integrated into Send page with contact picker
  - QRCode component (`src/components/send/qr-code.tsx`) using qrcode library for wallet address display
  - Receive page (`/receive`) with QR code toggle, copy address button, and token compatibility warning

- **Phase 3.2: Unified Balance**
  - UnifiedBalance component (`src/components/assets/unified-balance.tsx`) showing total volume, avg swap size, bridge volume
  - AssetsPage (`/assets`) with token list (ETH/USDC/EURC), quick action links (Swap/Bridge/Send/Receive)

### Changed

- Updated `PROJECT_STATE.md` with Phase 3.1 and 3.2 completion status
- Updated `SYSTEM_KNOWLEDGE.md` with Address Book, Receive/QR, and Assets/Unified Balance flows
- Updated `package.json` with qrcode and @types/qrcode dependencies

---

## [2026-06-07] - v0.1.4

### Added

- **Phase 1.3: Token Swap**
  - AppKit SDK swap wrapper (`src/lib/app-kit/swap.ts`) with `getSwapQuote`, `executeSwap`, `buildSwapTransaction`, `isValidSwapAmount`
  - `useTokenBalance` hook for fetching wallet token balances (native ETH + ERC20)
  - `SwapSettings` modal for configuring slippage tolerance (0.1%, 0.5%, 1%, custom)
  - `WalletModalProvider` and `useWalletModal` hook for wallet modal state management

### Changed

- Enhanced `TokenBox` with MAX button, accurate USD value based on input amount, and balance validation
- Enhanced `TokenSelector` with real wallet balance fetching and proper native ETH handling
- Enhanced `SwapPage` with debounced quote fetching, full execution flow, and all UI states (loading/error/success/pending)
- Slide-up animation for modal components

---

## [2026-06-07] - v0.1.3

### Added

- `useWallet` hook with wallet operations
- `NetworkSwitcher` component for chain switching
- `Landing` page with hero, features, and ticker sections (based on index.html)
- `NavbarScrollEffect` for navbar scrolled state
- `StatCounter` component for animated number counting
- Toast system with `ToastProvider` and `useToast` hook

### Changed

- Updated `Navbar` with `NetworkSwitcher` integration
- Updated `Providers` with `ToastProvider`
- Added `lucide-react` for icons

---

## [2026-06-07] - v0.1.2

### Added

- `CursorEffects` component with custom cursor and ring
- `CanvasBackground` component with nodes animation
- `NavScrollEffect` for navbar scrolled state
- `StatCounter` component for animated number counting
- Toast system with `ToastProvider` and `useToast` hook

### Changed

- Updated `globals.css` with all design variables and animations
- Updated `layout.tsx` with effects components

---

## [2026-06-07] - v0.1.1

### Added

- `useWallet` hook with wallet operations
- `NetworkSwitcher` component for chain switching
- `Landing` page with hero, features, and ticker sections (based on index.html)
- `NavbarScrollEffect` for navbar scrolled state

### Changed

- Updated `Navbar` with `NetworkSwitcher` integration
- Added `lucide-react` for icons

---

## [2026-06-07] - v0.1.0

### Added

- Initial project setup with rules framework
- `Rules/PROJECT_RULES.md` with project guidelines
- Technology stack: Next.js, App Kit SDK, Supabase
- Development roadmap (5 phases)
- `BUILD_PLAN.md` with detailed task breakdown
- Next.js 14 project structure with TypeScript + Tailwind CSS
- Arc Testnet chain configuration (chain ID: 421614)
- wagmi config with Arc, Sepolia, Mainnet, Polygon, Arbitrum support
- App Kit SDK config with supported tokens (USDC, EURC, ETH)
- UI components: `Button`, `Input`, `Card`, `Badge`
- `Navbar` and `WalletModal` components
- `Swap` page with `TokenBox` and `TokenSelector`
- Zustand store for app state management
- `useSwap` hook for swap logic

---

## [2026-06-06] - v0.0.2

### Fixed

- Fixed `app-store` Map serialization issue (changed Map to Record for zustand persist)
- Fixed toast component to remove styled-jsx dependency (incompatible with App Router)
- Fixed `TokenBox` to properly display USD values based on input amount (not balance)
- Fixed `TokenSelector` to correctly handle native ETH (zero address)
- Fixed `useSwap` to use `SwapQuote` type and implement full quote/execute cycle with status management

### Changed

- Added AppKit swap method and type exports
- BUILD_PLAN task numbering unified with PROJECT_STATE (1.1-1.8)
- Unlocked Phase 1.3 tasks as complete in BUILD_PLAN

---

## [2026-06-05] - v0.0.1

### Added

- Initial ARCquick project skeleton
- Project rules and documentation structure
- README with project overview
