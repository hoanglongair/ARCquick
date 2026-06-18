# PROJECT_STATE.md

## Purpose

PROJECT_STATE.md là nguồn thông tin duy nhất phản ánh trạng thái hiện tại của dự án.

Mục tiêu:

* Giúp agent mới nhanh chóng hiểu dự án đang ở đâu.
* Giảm chi phí đọc lại toàn bộ codebase.
* Giúp các thành viên theo dõi tiến độ phát triển.
* Ghi nhận các vấn đề đang tồn tại.

## Current Phase

**Phase 3: Advanced** - 3.1✅ 3.2✅ 3.3✅ 3.4✅ **Phase 3.5 Live Prices ✅** COMPLETED!

## Completed Features

### Project Setup
- [x] Tạo project rules framework
- [x] Xác định technology stack
- [x] Định nghĩa development roadmap

### Documentation
- [x] ARCHITECTURE.md - Cấu trúc kỹ thuật
- [x] SYSTEM_KNOWLEDGE.md - Business flows
- [x] PROJECT_STATE.md - Trạng thái dự án
- [x] CHANGELOG.md - Lịch sử thay đổi
- [x] PROJECT_RULES.md - Project guidelines
- [x] BUILD_PLAN.md - Kế hoạch chi tiết xây dựng

### Phase 3.5: Live Prices ✅
- [x] Server route `/api/prices` proxying CoinGecko with 60s in-memory cache
- [x] `usePriceFeed` hook (existing) remains single source of truth for live USD + 24h change
- [x] `useTokenListWithPrices` hook merges on-chain `TOKEN_LIST` with live prices
- [x] `src/lib/tokens.ts` refactored to metadata-only; no mock prices
- [x] `useSwap.getQuote` and `app-kit/swap.ts` use live prices for exchange rate
- [x] `TokenBox` USD value, `TokenSelector` value column use live prices
- [x] Home page ticker + supported-assets grid use live prices via `usePriceFeed`

### Phase 1.1: Project Initialization ✅
- [x] Tạo Next.js 14 project với TypeScript + Tailwind
- [x] Cấu trúc thư mục theo architecture
- [x] Cấu hình environment variables
- [x] Cấu hình Arc Network trong wagmi (Arc Testnet chain)
- [x] Setup App Kit SDK (config + provider)

### Phase 1.2: Wallet Connection ✅
- [x] WalletProvider component (sử dụng wagmi có sẵn)
- [x] ConnectButton component (tích hợp trong Navbar)
- [x] WalletModal component (MetaMask, WalletConnect, Coinbase)
- [x] NetworkSwitcher component (Arc Sepolia, Sepolia, Ethereum, Polygon, Arbitrum)
- [x] useWallet hook
- [x] Landing page với effects (cursor, canvas, animations)

### Phase 1.3: Token Swap (App Kit Swap) ✅
- [x] SwapPage component
- [x] TokenBox component (MAX button, USD value, balance check)
- [x] TokenSelector component (wallet balance, ETH handling)
- [x] useTokenBalance hook
- [x] useSwap hook với quote/execute cycle
- [x] SwapSettings modal (slippage tolerance)
- [x] AppKit SDK swap wrapper

### Phase 1.4: Cross-Chain Bridge (CCTP) ✅
- [x] BridgePage component
- [x] ChainSelector component (source + destination chain)
- [x] Bridge chains config (Arc, Sepolia, Ethereum, Polygon, Arbitrum)
- [x] Bridge AppKit wrapper
- [x] useBridge hook
- [x] Destination address input

### Phase 1.5: Basic Send (App Kit Send) ✅
- [x] SendPage component
- [x] AddressInput component (validation, clipboard paste, visual feedback)
- [x] useSend hook với validation, execute, status management
- [x] Token selector cho Send page
- [x] Send UI states (confirming, pending, success, error)
- [x] Memo/note field

### Phase 1.6: Transaction History ✅
- [x] TransactionPage component với filter tabs
- [x] TransactionList component (grouped by date)
- [x] TransactionToast component
- [x] useTransactionHistory hook
- [x] Clear history + Explorer links

### Phase 2.1: User Authentication (Supabase) ✅
- [x] Supabase client setup
- [x] AuthProvider + useAuth hook
- [x] AuthModal (sign in / sign up / password toggle)
- [x] Email + password authentication flow
- [x] User state integrated in Navbar (dropdown, profile link)

### Phase 2.3: Advanced Swap Settings ✅
- [x] SwapSettings modal với tabs (Swap / Advanced)
- [x] Slippage tolerance (0.1%, 0.5%, 1%, custom)
- [x] Transaction deadline (1-60 minutes)
- [x] Gas preference (slow/normal/fast)
- [x] App store với deadline, gas preference, theme settings

### Phase 2.4: Analytics Dashboard ✅
- [x] StatsCard component (animated counter, trend indicator)
- [x] AnalyticsDashboard (total volume, gas spent, success rate, tx count)
- [x] Volume chart (12-month bar chart)
- [x] Transaction types pie chart (swaps/bridges/sends)
- [x] DashboardPage route

### Phase 2.5: Multi-Network Support ✅
- [x] Chain features config (per-chain tokens, features, explorer)
- [x] useNetworkPreferences hook
- [x] Supported chains: Arc Sepolia, Sepolia, Ethereum, Polygon, Arbitrum
- [x] Per-chain feature availability tracking

### Phase 3.1: Send Money Enhancements ✅
- [x] AddressBook store (Zustand, persisted)
- [x] AddressBook component (add/edit/delete/search contacts)
- [x] QRCode component (qrcode library, share wallet address)
- [x] Receive page (/receive) with QR + copy address
- [x] Send page integration (address book picker)

### Phase 3.2: Unified Balance ✅
- [x] UnifiedBalance component
- [x] AssetsPage (/assets) with token list + quick actions
- [x] Volume stats + bridge volume tracking
- [x] Quick action links (Swap/Bridge/Send/Receive)

## Pending Features

### Phase 2: Enhanced Features
- [x] ~~User Authentication (Supabase)~~ (Phase 2.1 completed)
- [x] ~~Advanced Swap Settings~~ (Phase 2.3 completed)
- [x] ~~Analytics Dashboard~~ (Phase 2.4 completed)
- [x] ~~Multi-Network Support~~ (Phase 2.5 completed)

**Phase 2 COMPLETED!**

### Phase 3.3: Real-time Updates ✅
- [x] `usePriceFeed` hook (CoinGecko API, 30s polling)
- [x] `useTokenPrice` hook for individual token prices
- [x] Price alerts store (`src/stores/price-alert-store.ts`) with Zustand persist
- [x] `PriceAlertPanel` component with create/remove/reset alerts
- [x] Price alerts integrated into Settings modal (Alerts tab)
- [x] `usePriceAlertChecker` hook - auto-triggers toast when price hits target
- [x] `useTransactionWatcher` hook - real on-chain tx confirmation monitoring
- [x] `useSwap` + `useBridge` updated - replaced fake setTimeout with real chain watcher
- [x] Price alert checker auto-enabled via `Providers`

### Phase 3.4: Advanced Trading ✅
- [x] Limit orders store (`src/stores/advanced-trading-store.ts`) with Zustand persist, buy/sell, target price, expiry
- [x] `useLimitOrderChecker` hook - auto-executes limit orders when price crosses target
- [x] TWAP orders support in store - split orders into configurable tranches (2-12), interval 15m-4h
- [x] `useTwapExecutor` hook - auto-executes TWAP tranches on schedule (10s polling)
- [x] `AdvancedTradingPanel` component - Limit/TWAP/Routes tabs with create forms
- [x] `ActiveOrdersPanel` component - live order cards with cancel/remove/history
- [x] `/trading` page with full order management UI
- [x] Best price router (`src/lib/app-kit/router.ts`) - compares 5 routes (AppKit, Uniswap V2/V3, Curve, Balancer) with fee-adjusted pricing
- [x] `RoutesPanel` - shows all route quotes with best route highlighted
- [x] Navbar updated with TRADING link
- [x] Order checkers auto-enabled via `Providers`

### Phase 4: Security ✅
- [x] Security store (`src/stores/security-store.ts`) with Zustand persist - whitelist, daily limits, settings
- [x] Address whitelisting - add/remove approved recipients, toggle per-feature
- [x] Daily limits - USD cap per token/chain, auto-reset daily, progress bar display
- [x] Transaction simulation (`useTransactionSimulation` hook) - preview gas/price impact/warnings before signing
- [x] Anomaly detection (`useAnomalyDetector` hook) - large tx, new recipient, unusual time, rate limit rules
- [x] Gas price alerts (`useGasPriceAlerts` hook) - configurable gwei threshold, toast notification
- [x] `SecuritySettingsPanel` component with 5 sections: Simulation, Whitelist, Daily Limits, Anomaly, Gas Alerts
- [x] Security tab added to SwapSettings modal
- [x] `useSend` updated - replaced fake setTimeout with real chain watcher (Phase 3.3 consistency)

### Phase 5: UX
- [ ] Dark/Light Theme
- [ ] i18n Support
- [ ] PWA Support

## Known Issues

- Bug: Swap ETH→ERC20 failed with "Address invalid" because placeholder `0x036aBf8B...` (39 hex chars) was used as USDC contract address in `useSwap`/App Kit config/token selectors. **Fixed in v0.2.1** by introducing `src/lib/tokens.ts` as single source of truth and replacing with real Arc Testnet USDC (`0x3600...`).
- Bug: After submitting a tx, `useWaitForTransactionReceipt` reported `chain: undefined (id: 5042002)` and Arc Testnet RPC returned "too many errors". **Fixed in v0.2.1** by: (a) not passing `chainId` in sendTransaction/writeContract calls (let wagmi use wallet's current chain), (b) increasing tx watcher polling interval to 4s and disabling auto-retry, (c) reducing wagmi batch size from 100→10 and adding transport-level fallback.

## Technical Stack

```
Frontend:     Next.js 14 (App Router) + Tailwind CSS
State:        Zustand + React Query
Web3:         Viem v2 + wagmi
Swap/Bridge:  @circle-app/app-kit (App Kit SDK)
Backend:      Node.js + Express
ORM:          Drizzle ORM
Database:     PostgreSQL (Supabase)
Auth:         Supabase Auth
Hosting:      Vercel (frontend) + Railway (backend)
Blockchain:   Arc Network (EVM)
```

## Update Rules

Agent phải cập nhật PROJECT_STATE.md khi:

* Hoàn thành một feature.
* Bắt đầu một feature mới.
* Thay đổi trạng thái công việc.
* Phát hiện issue quan trọng.

Không ghi log kỹ thuật chi tiết.
Không ghi commit history.
Không ghi implementation details.
Chỉ ghi trạng thái hiện tại của dự án.
