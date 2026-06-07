# BUILD_PLAN.md

## ARCquick - Chi tiết xây dựng features

---

## PHASE 1: Core MVP (Phase hiện tại)

### Mục tiêu: Có một DEX cơ bản hoạt động được trên Arc Testnet

---

### 1.1 Project Initialization

**Tasks:**
- [ ] 1.1.1 Tạo Next.js 14 project với TypeScript
  - Setup App Router
  - Cấu hình Tailwind CSS
  - Cấu hình ESLint + Prettier
  
- [ ] 1.1.2 Cấu trúc thư mục theo architecture
  ```
  src/
  ├── app/                    # Next.js App Router
  │   ├── layout.tsx
  │   ├── page.tsx            # Landing page
  │   ├── swap/page.tsx       # Swap feature
  │   ├── bridge/page.tsx     # Bridge feature
  │   └── send/page.tsx       # Send feature
  ├── components/
  │   ├── ui/                 # UI primitives
  │   ├── wallet/             # Wallet connection
  │   ├── swap/               # Swap components
  │   ├── bridge/             # Bridge components
  │   └── send/               # Send components
  ├── lib/
  │   ├── app-kit/            # App Kit SDK wrapper
  │   ├── wagmi/              # Wagmi config
  │   └── utils/              # Utilities
  ├── hooks/                  # Custom hooks
  ├── stores/                 # Zustand stores
  └── types/                  # TypeScript types
  ```

- [ ] 1.1.3 Cấu hình environment variables
  - `NEXT_PUBLIC_APP_KIT_KEY` - Circle App Kit key
  - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - WalletConnect project ID

- [ ] 1.1.4 Cấu hình Arc Network trong wagmi
  - Arc Testnet RPC
  - Arc Mainnet RPC (future)

- [ ] 1.1.5 Setup App Kit SDK
  - Install packages
  - Create App Kit instance
  - Configure adapters (viem)

---

### 1.2 Wallet Connection

**Tasks:**
- [ ] 1.2.1 Tạo WalletProvider component
  - Wrap app với WagmiProvider
  - Setup wagmi config với Arc chains
  
- [ ] 1.2.2 Tạo ConnectButton component
  - Default state: "Connect Wallet"
  - Connected state: Hiển thị address (0x3f...a4e2)
  - Dropdown menu: View on Explorer, Disconnect

- [ ] 1.2.3 Tạo WalletModal component
  - MetaMask option
  - WalletConnect option
  - Coinbase Wallet option
  
- [ ] 1.2.4 Implement network detection
  - Detect current chain
  - Prompt switch to Arc if wrong network
  - Add Arc Testnet button

- [ ] 1.2.5 Tạo useWallet hook
  - `useAccount()` - current account
  - `useConnect()` - connect function
  - `useDisconnect()` - disconnect function
  - `useChainId()` - current chain

---

### 1.3 App Kit Integration

**Tasks:**
- [ ] 1.3.1 Setup App Kit instance
  - Initialize with kit key
  - Configure viem adapter
  - Setup error handling

- [ ] 1.3.2 Tạo AppKitProvider component
  - Context provider cho App Kit
  - Error boundary

- [ ] 1.3.3 Tạo types cho App Kit
  - Swap types
  - Bridge types
  - Token types

---

### 1.4 Token Swap (App Kit Swap)

**Tasks:**
- [ ] 1.4.1 Tạo SwapPage component
  - Layout với token boxes
  - Swap direction toggle

- [ ] 1.4.2 Tạo TokenSelector component
  - Token list modal
  - Search functionality
  - Token icons và balances

- [ ] 1.4.3 Tạo TokenBox component
  - Input field cho amount
  - Balance display
  - MAX button
  - USD value calculation

- [ ] 1.4.4 Implement swap quote
  - Gọi `sdk.swap.getQuote()`
  - Display exchange rate
  - Display price impact
  - Display gas estimate

- [ ] 1.4.5 Implement swap execution
  - Build swap transaction
  - Request wallet signature
  - Submit transaction
  - Track transaction status

- [ ] 1.4.6 Tạo useSwap hook
  - `getQuote()` - fetch quote
  - `executeSwap()` - execute swap
  - `useSwapHistory()` - transaction history

- [ ] 1.4.7 UI States
  - Loading state (fetching quote)
  - Error state (invalid amount, insufficient balance)
  - Success state (transaction confirmed)
  - Pending state (awaiting confirmation)

---

### 1.5 Token Balance Display

**Tasks:**
- [ ] 1.5.1 Tạo useTokenBalance hook
  - Fetch balance từ Arc RPC
  - Auto-refresh interval
  - Cache results

- [ ] 1.5.2 Tạo TokenBalance component
  - Display balance với decimals
  - Display USD value
  - Loading skeleton

- [ ] 1.5.3 Tạo TokenList component
  - Grid/List view
  - Token icons
  - Price và 24h change

- [ ] 1.5.4 Implement token price fetching
  - Fetch từ CoinGecko/CoinMarketCap (free tier)
  - Fallback to static prices
  - Cache với React Query

---

### 1.6 Cross-Chain Bridge (App Kit Bridge)

**Tasks:**
- [ ] 1.6.1 Tạo BridgePage component
  - Source chain selector
  - Destination chain selector
  - Amount input

- [ ] 1.6.2 Tạo ChainSelector component
  - Supported chains list
  - Chain icons
  - Network status indicator

- [ ] 1.6.3 Implement bridge quote
  - Gọi `sdk.bridge.getQuote()`
  - Display estimated arrival time
  - Display bridge fee

- [ ] 1.6.4 Implement bridge execution
  - Build bridge transaction
  - Handle CCTP flow
  - Track bridge progress

- [ ] 1.6.5 Tạo useBridge hook
  - `getQuote()` - fetch bridge quote
  - `executeBridge()` - execute bridge
  - `trackBridge()` - track bridge status

- [ ] 1.6.6 Tạo BridgeHistory component
  - Pending bridges
  - Completed bridges
  - Failed bridges

---

### 1.7 Basic Send (App Kit Send)

**Tasks:**
- [ ] 1.7.1 Tạo SendPage component
  - Recipient address input
  - Amount input
  - Token selector

- [ ] 1.7.2 Tạo AddressInput component
  - Address validation
  - ENS resolution (future)
  - QR code scanner button

- [ ] 1.7.3 Implement send transaction
  - Build send transaction
  - Request signature
  - Submit to network

- [ ] 1.7.4 Tạo useSend hook
  - `sendToken()` - execute send
  - `validateAddress()` - address validation

---

### 1.8 Transaction Display & History

**Tasks:**
- [ ] 1.8.1 Tạo TransactionToast component
  - Pending indicator
  - Success/Fail state
  - View on Explorer link

- [ ] 1.8.2 Tạo TransactionList component
  - Grouped by date
  - Type icon (swap/bridge/send)
  - Status badge

- [ ] 1.8.3 Tạo TransactionDetail component
  - Modal/Panel view
  - Full transaction data
  - Copy hashes

- [ ] 1.8.4 Implement local storage
  - Save transactions locally
  - Sync on app load

---

## PHASE 2: Enhanced Features

### Mục tiêu: Thêm authentication, analytics, và cải thiện trải nghiệm

---

### 2.1 User Authentication (Supabase)

**Tasks:**
- [ ] 2.1.1 Setup Supabase project
  - Create project on Supabase
  - Setup authentication
  - Configure RLS policies

- [ ] 2.1.2 Tạo SupabaseProvider
  - Initialize Supabase client
  - Handle auth state

- [ ] 2.1.3 Implement email auth
  - Sign up / Sign in
  - Password reset
  - Email verification

- [ ] 2.1.4 Link wallet to account
  - Store wallet addresses in DB
  - Verify wallet ownership (sign message)

- [ ] 2.1.5 Tạo ProfilePage
  - View/Edit profile
  - Manage linked wallets
  - Account settings

---

### 2.2 Database & Transaction History

**Tasks:**
- [ ] 2.2.1 Design database schema
  ```
  users
  ├── id (uuid)
  ├── email
  ├── created_at
  └── wallets (array)

  transactions
  ├── id (uuid)
  ├── user_id (fk)
  ├── type (swap/bridge/send)
  ├── status (pending/confirmed/failed)
  ├── from_token
  ├── to_token
  ├── from_amount
  ├── to_amount
  ├── hash
  ├── chain_id
  ├── created_at
  └── metadata (jsonb)
  ```

- [ ] 2.2.2 Implement Drizzle ORM
  - Define schemas
  - Create migrations
  - Setup connection

- [ ] 2.2.3 CRUD operations
  - Create transaction
  - Read transactions (paginated)
  - Update transaction status
  - Delete transaction (soft delete)

- [ ] 2.2.4 Backend API routes
  - `POST /api/transactions` - Create
  - `GET /api/transactions` - List
  - `GET /api/transactions/[id]` - Detail

---

### 2.3 Advanced Swap Settings

**Tasks:**
- [ ] 2.3.1 Tạo SettingsModal component
  - Slippage tolerance slider (0.01% - 50%)
  - Transaction deadline
  - Gas price preference (slow/normal/fast)

- [ ] 2.3.2 Implement slippage calculation
  - Show minimum received
  - Warning for high slippage
  - Auto-adjust for volatile pairs

- [ ] 2.3.3 Persist settings
  - Save to localStorage
  - Save to user profile (if logged in)

---

### 2.4 Analytics Dashboard

**Tasks:**
- [ ] 2.4.1 Tạo DashboardPage
  - Portfolio overview
  - Total volume traded
  - Gas spent

- [ ] 2.4.2 Implement charts
  - Volume chart (30 days)
  - Portfolio distribution pie chart
  - Gas spent bar chart

- [ ] 2.4.3 Tạo StatsCard component
  - Animated counter
  - Trend indicator
  - Time range selector

- [ ] 2.4.4 Export data
  - CSV export
  - PDF report (future)

---

### 2.5 Multi-Network Support

**Tasks:**
- [ ] 2.5.1 Tạo NetworkSwitcher
  - Arc Testnet
  - Arc Mainnet (when live)
  - Other EVM chains (via bridge)

- [ ] 2.5.2 Implement multi-chain detection
  - Detect wallet network
  - Prompt switch
  - Update available features per chain

- [ ] 2.5.3 Update token list per network
  - Different tokens per chain
  - Different prices per chain

---

## PHASE 3: Advanced Features

### Mục tiêu: Mở rộng tính năng trading và real-time

---

### 3.1 Send Money Enhancements

**Tasks:**
- [ ] 3.1.1 Tạo AddressBook
  - Save frequent recipients
  - Labels/notes
  - Quick select

- [ ] 3.1.2 QR Code generation
  - Generate QR for receiving
  - Share payment link

- [ ] 3.1.3 Transaction memo
  - Add note to transaction
  - Search transactions by memo

---

### 3.2 Unified Balance (App Kit)

**Tasks:**
- [ ] 3.2.1 Implement unified balance
  - Aggregate USDC from all chains
  - Display total balance

- [ ] 3.2.2 Tạo BalanceOptimizer
  - Suggest consolidating balances
  - Show gas costs vs savings

- [ ] 3.2.3 One-click consolidate
  - Bridge all to Arc
  - Single transaction

---

### 3.3 Real-time Updates

**Tasks:**
- [ ] 3.3.1 WebSocket connection
  - Price updates
  - Transaction status updates

- [ ] 3.3.2 Price alerts
  - Set alert for token price
  - Push notification

- [ ] 3.3.3 Live transaction tracking
  - Real-time status updates
  - Estimated completion time

---

### 3.4 Advanced Trading

**Tasks:**
- [ ] 3.4.1 Limit orders
  - Set target price
  - Auto-execute when reached

- [ ] 3.4.2 TWAP orders
  - Split large orders
  - Time-weighted average

- [ ] 3.4.3 Best price routing
  - Compare across DEXes
  - Optimal path calculation

---

## PHASE 4: Security & Compliance

### Mục tiêu: Bảo mật và tuân thủ

---

### 4.1 Security Features

**Tasks:**
- [ ] 4.1.1 Transaction simulation
  - Tenderly integration
  - Preview before confirm

- [ ] 4.1.2 Address whitelisting
  - Approved recipient list
  - Quick send to whitelist

- [ ] 4.1.3 Daily limits
  - Set daily transfer limit
  - Require 2FA for large tx

- [ ] 4.1.4 Hardware wallet support
  - Ledger
  - Trezor

---

### 4.2 Monitoring

**Tasks:**
- [ ] 4.2.1 Anomaly detection
  - Unusual activity alerts
  - Rate limiting

- [ ] 4.2.2 Gas price alerts
  - Notify when gas is low
  - Schedule transactions

---

## PHASE 5: UX Enhancements

### Mục tiêu: Cải thiện trải nghiệm người dùng

---

### 5.1 Theme & i18n

**Tasks:**
- [ ] 5.1.1 Dark/Light theme toggle
  - System preference detection
  - Manual toggle
  - Persist preference

- [ ] 5.1.2 Internationalization
  - English (default)
  - Vietnamese
  - More languages (future)

- [ ] 5.1.3 Number/Currency formatting
  - Locale-aware formatting

---

### 5.2 PWA & Mobile

**Tasks:**
- [ ] 5.2.1 PWA setup
  - Service worker
  - Manifest
  - Install prompt

- [ ] 5.2.2 Responsive design
  - Mobile-first approach
  - Touch-friendly UI

- [ ] 5.2.3 Mobile app (optional)
  - React Native (future)
  - Capacitor wrapper

---

### 5.3 Onboarding

**Tasks:**
- [ ] 5.3.1 Guided tour
  - First-time user tour
  - Feature highlights

- [ ] 5.3.2 Tutorial videos
  - How to swap
  - How to bridge
  - How to send

- [ ] 5.3.3 FAQ/Help center
  - Searchable knowledge base
  - Contact support

---

## Dependency Graph

```
Phase 1 (Foundation)
├── 1.1 Project Init
├── 1.2 Wallet Connection ──┐
├── 1.3 App Kit ────────────┼── Core dependencies
├── 1.4 Token Swap ──────────┤
├── 1.5 Balance Display ─────┤
├── 1.6 Bridge ──────────────┤
├── 1.7 Send ────────────────┤
└── 1.8 Transaction UI ─────┘

Phase 2 (Enhanced)
├── 2.1 Auth ──────────────┐
├── 2.2 Database ──────────┼── User features
├── 2.3 Swap Settings ────┤
├── 2.4 Dashboard ────────┤
└── 2.5 Multi-Network ─────┘

Phase 3 (Advanced)
├── 3.1 Send Enhancements
├── 3.2 Unified Balance
├── 3.3 Real-time Updates
└── 3.4 Advanced Trading

Phase 4 (Security)
├── 4.1 Security Features
└── 4.2 Monitoring

Phase 5 (UX)
├── 5.1 Theme & i18n
├── 5.2 PWA & Mobile
└── 5.3 Onboarding
```

---

## Estimated Timeline

| Phase | Features | Estimated Time |
|-------|----------|---------------|
| Phase 1 | Core MVP | 2-3 weeks |
| Phase 2 | Enhanced | 1-2 weeks |
| Phase 3 | Advanced | 1-2 weeks |
| Phase 4 | Security | 1 week |
| Phase 5 | UX | 1 week |

**Total: ~6-9 weeks** (tùy vào thời gian mỗi ngày)

---

## Priority Order for Phase 1

1. **1.1** Project Init - Setup project
2. **1.2** Wallet Connection - Kết nối ví
3. **1.3** App Kit Integration - Kết nối SDK
4. **1.5** Balance Display - Hiển thị số dư
5. **1.4** Token Swap - Tính năng swap
6. **1.6** Cross-Chain Bridge - Tính năng bridge
7. **1.7** Basic Send - Tính năng send
8. **1.8** Transaction UI - UI giao dịch
