# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
- Updated `Providers` with `ToastProvider`

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

- **Phase 1.4: Cross-Chain Bridge (COMPLETED)**
  - BridgePage component with source/destination chain selection
  - ChainSelector component for chain selection modal
  - Bridge chains config (`src/lib/app-kit/bridge-chains.ts`) with Arc, Sepolia, Ethereum, Polygon, Arbitrum
  - Bridge AppKit wrapper (`src/lib/app-kit/bridge.ts`) with getBridgeQuote, executeBridge, buildBridgeTransaction, isValidBridgeAmount
  - useBridge hook with full quote/execute cycle, status management, and transaction tracking
  - Destination address input for bridging to different addresses
  - Bridge route added to navbar navigation

- **Phase 1.5: Basic Send (COMPLETED)**
  - SendPage component with address input, token selector, amount, and memo fields
  - AddressInput component with Ethereum address validation, clipboard paste, and visual feedback
  - useSend hook with full validation (address, amount, self-send check), execute flow, and status management
  - Token selector integration for choosing which token to send
  - Send UI states (confirming, pending, success, error) with Toast feedback
  - Memo/note field for adding transfer notes (140 char limit)
  - Send route added to navbar navigation

- **Phase 1.6: Transaction History (COMPLETED)**
  - TransactionPage component with filter tabs (All/Swaps/Bridges/Sends)
  - TransactionList component with grouped-by-date view
  - TransactionToast component for pending transaction notifications
  - useTransactionHistory hook with filtering, grouping, and stats calculation
  - Clear history functionality
  - Explorer links for each transaction hash

- **Phase 2.1: User Authentication (COMPLETED)**
  - Supabase client setup (`src/lib/supabase/client.ts`)
  - AuthProvider + useAuth hook with email/password sign-in and sign-up flow
  - AuthModal component with sign-in/sign-up toggle, password visibility toggle, validation, and error handling
  - User state integrated into Navbar with dropdown, profile link, and settings access
- **Phase 2.3: Advanced Swap Settings (COMPLETED)**
  - SwapSettings modal with tabs (Swap / Advanced)
  - Slippage tolerance options (0.1%, 0.5%, 1%, custom)
  - Transaction deadline configuration (1-60 minutes)
  - Gas preference selector (slow/normal/fast)
  - App store enhanced with deadline, gas preference, and theme settings (persisted to localStorage)

- **Phase 2.4: Analytics Dashboard (COMPLETED)**
  - StatsCard component with animated counter, trend indicator, and color variants
  - AnalyticsDashboard with total volume, transaction count, gas spent, and success rate cards
  - 12-month volume bar chart
  - Transaction types donut chart (swaps/bridges/sends breakdown)
  - DashboardPage at `/dashboard` route
- **Phase 2.5: Multi-Network Support (COMPLETED)**
  - Chain features config with per-chain tokens, feature availability, and explorer URLs
  - useNetworkPreferences hook for chain-aware token/feature selection
  - Supported chains: Arc Sepolia, Sepolia, Ethereum, Polygon, Arbitrum
- **Phase 3.1: Send Money Enhancements (COMPLETED)**
  - AddressBook store (Zustand, persisted) with add/edit/delete/search contacts
  - AddressBook component integrated into Send page
  - QRCode component using qrcode library for wallet address display
  - Receive page (`/receive`) with QR code display and copy address functionality
- **Phase 3.2: Unified Balance (COMPLETED)**
  - UnifiedBalance component showing total volume and stats
  - AssetsPage (`/assets`) with token list and quick action links
  - Quick actions: Swap, Bridge, Send, Receive navigation

### Changed

- Updated `PROJECT_STATE.md` with project status
- Updated `SYSTEM_KNOWLEDGE.md` with business flows
- Updated `package.json` with all required dependencies

---

## [2026-06-07] - v0.0.2

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

## Version History

| Version | Date       | Description                          |
|---------|------------|--------------------------------------|
| v0.0.1  | 2026-05-31 | Initial rules setup and documentation |
| v0.0.0  | 2026-05-31 | Project concept - ARCquick DEX on Arc Network |
