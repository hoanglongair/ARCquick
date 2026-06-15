# SYSTEM_KNOWLEDGE.md

## Purpose

SYSTEM_KNOWLEDGE.md là tài liệu mô tả cách hệ thống hoạt động ở mức nghiệp vụ.

Mục tiêu:

* Giúp agent hiểu business flow mà không cần đọc code.
* Giúp đồng bộ hiểu biết giữa các thành viên.
* Là tài liệu tham khảo khi phát triển tính năng mới.

## Content Requirements

Tài liệu phải tập trung vào:

### Business Flows

#### ARCquick Overview
ARCquick là một Decentralized Exchange (DEX) trên mạng Arc - Layer 1 blockchain chuyên về stablecoin-native applications.

**Đặc điểm của Arc:**
- USDC là gas token (không cần ETH để trả phí)
- Sub-second deterministic finality
- EVM-compatible
- CCTP (Circle Cross-Chain Transfer Protocol) cho cross-chain

#### Core User Flows

**1. Wallet Connection Flow**
```
User clicks "Connect Wallet"
  → Open wallet selector modal
  → User selects wallet (MetaMask/WalletConnect/Coinbase)
  → Request wallet connection
  → On success: Update UI, store connection state
  → On failure: Show error toast
```

**2. Token Swap Flow**
```
User enters amount to swap
  → Validate input (not empty, not exceeds balance)
  → Fetch quote from App Kit SDK
  → Display exchange rate, gas estimate
  → User clicks "Swap"
  → Request transaction signature
  → Submit to Arc network
  → Show pending state
  → On confirmation: Update balances, show success
  → On failure: Show error, allow retry

  Note: ARCquick does not yet integrate a live DEX router. As a placeholder,
  the "Swap" action performs a self-transfer so the wallet signing flow can be
  exercised end-to-end:
    • Native → any token: native is sent to the user's own address
    • ERC20 → any token: a transfer is sent from the user to themselves
  Quotes are computed locally from the cached price feed. Production will
  replace both branches with a call to the on-chain router.
```

**3. Cross-Chain Bridge Flow**
```
User selects source/destination chains
  → User enters amount to bridge
  → Validate bridge limits
  → Fetch bridge quote
  → Request user confirmation
  → Request transaction signature
  → Submit burn/mint transactions
  → Track bridge progress
  → Update destination balance on completion
```

**4. Send Token Flow**
```
User enters recipient address
  → Validate address format
  → User enters amount
  → Validate balance
  → Request transaction signature
  → Submit transfer
  → Show pending → Confirmed
```

**5. User Authentication Flow**
```
User clicks "Sign In"
  → Open auth modal
  → User enters email + password
  → Validate inputs
  → Submit to Supabase Auth
  → On success: Update user state, close modal
  → On failure: Show error message
  → Optional: Link wallet address to account
```

**6. Advanced Swap Settings Flow**
```
User opens Settings from Swap page
  → Configure slippage tolerance (0.1% - 50%)
  → Configure transaction deadline (1-60 min)
  → Set gas preference (slow/normal/fast)
  → Settings persisted to localStorage
  → Applied to all subsequent swap transactions
```

**7. Multi-Network Support Flow**
```
User switches network via NetworkSwitcher
  → Detect current chain
  → Update available features per chain
  → Update supported token list
  → Refresh balances for new chain
```

**8. Analytics Dashboard Flow**
```
User navigates to /dashboard
  → Fetch transaction history from local store
  → Calculate aggregated stats (volume, gas, success rate)
  → Generate volume chart (12 months)
  → Generate transaction type breakdown
  → Display with animated counters
```

**9. Address Book Flow**
```
User opens Send page
  → AddressBook displays saved contacts
  → User can search by label/address/note
  → Click contact to auto-fill recipient
  → User can add/edit/delete contacts
  → Contacts persisted to localStorage (up to 50)
```

**10. Receive / QR Code Flow**
```
User navigates to /receive
  → Display wallet address (copy button)
  → Toggle QR code display
  → QR encodes wallet address for easy scanning
  → Warning shown about ARC-compatible tokens only
```

**11. Assets / Unified Balance Flow**
```
User navigates to /assets
  → Show unified balance (total volume stats)
  → List token balances per chain
  → Quick action links: Swap, Bridge, Send, Receive
  → Real-time balance refresh on page visit
```

**12. Price Alerts Flow**
```
User opens Settings modal → Alerts tab
  → Create alert: select token (ETH/USDC/EURC), condition (above/below), target price
  → Alert stored in Zustand (persisted)
  → Price feed polls CoinGecko every 30s
  → Alert checker runs on each price update
  → When price crosses threshold: toast notification + alert marked as triggered
  → User can reset, remove, or clear triggered alerts
```

**13. Transaction Live Tracking Flow**
```
User executes swap/bridge
  → Tx hash captured, pending status shown
  → useTransactionWatcher polls chain every 4s for confirmation
  → On confirm: "Transaction confirmed on-chain!" toast
  → On fail: "Transaction failed" toast + tx marked failed
  → If RPC endpoint is busy (rate-limited / 5xx): a "Network is busy" warning
    is shown but the tx is NOT marked failed. The on-chain tx is still valid;
    user is directed to the explorer for the canonical status.
  → A pending tx is auto-failed only after a 5-minute timeout with no
    on-chain progress.
```

**14. Advanced Trading Flow**
```
User opens /trading page or Trading tab
  → Create limit order: select pair, side (buy/sell), target price, expiry
  → Limit order stored in Zustand (persisted)
  → useLimitOrderChecker polls price feed every 30s
  → When price crosses target: auto-execute swap, show toast, mark completed

  → Create TWAP order: total amount, tranche count (2-12), interval (15m-4h)
  → TWAP stored in Zustand (persisted)
  → useTwapExecutor polls every 10s, executes tranche when interval passes
  → Each tranche: swap + toast notification
  → Last tranche: mark TWAP completed

  → Compare routes: enter amount, see all 5 route quotes with best highlighted
```

**15. Security Features Flow**
```
User opens Settings → Security tab
  → Address whitelist: add/remove addresses with labels, toggle enforcement
  → Daily limits: set USD cap, view usage progress bar, auto-resets daily
  → Transaction simulation: enable to preview gas/impact/warnings before signing
  → Anomaly detection: alerts for large tx, new recipient, unusual time, rate limit
  → Gas alerts: configurable gwei threshold, toast when exceeded

  Whitelist enforcement: when enabled, non-whitelisted recipients show warning
  Daily limit: transactions exceeding daily cap are blocked with error
  Simulation: runs before tx, shows pass/fail with warnings
  Anomaly: toast notification when unusual activity detected
  Gas alert: toast when gas price exceeds threshold (30min cooldown)
```

### Domain Rules

**1. Token Rules**
- Default token: ETH/USDC (primary on Arc)
- Supported tokens: ETH, USDC, EURC, WETH, USDT, DAI, ARB, MATIC
- Token balances fetched from Arc RPC via viem
- Prices fetched from CoinGecko API (`usePriceFeed` hook, 30s polling)
- Price alerts stored in Zustand (localStorage persist, up to 50 alerts)
- All token addresses (USDC contract, native placeholder) come from a single
  source of truth (`src/lib/tokens.ts`) so the app never ships an invalid or
  truncated address.

**2. Transaction Rules**
- All transactions require wallet connection
- Gas paid in native token of the chain
- Transaction history stored in Zustand (localStorage persist)
- Pending txs tracked via `useTransactionWatcher` hook with on-chain monitoring (polling every 2s)
- Toast notifications on tx confirmation/failure
- Transaction history supports swap, bridge, and send types

**3. Bridge Rules**
- Minimum bridge amount: varies by chain
- Bridge fees: ~0 (CCTP) + gas
- Estimated time: depends on destination chain
- Supported tokens: USDC, ETH (where applicable)
- Destination address can differ from source

**4. Security Rules**
- Non-custodial: users control their keys
- No private keys stored
- Transaction signing happens in wallet
- MEV protection via Arc network
- Email/password auth via Supabase (optional, not required for core features)

**5. User Settings Rules**
- Slippage tolerance: 0.01% - 50%, default 0.5%
- Transaction deadline: 1-60 minutes, default 20
- Gas preference: slow/normal/fast, default normal
- Settings persisted per-device via localStorage

### System Behaviors

**1. Network Detection**
- Auto-detect current network
- Prompt user to switch to Arc if wrong network
- Support Arc Testnet and Mainnet

**2. Error Handling**
- Network errors: retry with exponential backoff
- Transaction failures: show clear error message
- Invalid inputs: inline validation with feedback

**3. State Management**
- Wallet connection: persisted in localStorage
- Recent transactions: cached for quick access
- Token balances: refreshed on interval

## Update Rules

Agent phải cập nhật SYSTEM_KNOWLEDGE.md khi:

* Thêm business flow mới.
* Thay đổi business logic hiện có.
* Thêm hoặc sửa quy tắc nghiệp vụ.

Không ghi:

* Tên file.
* Tên hàm.
* Chi tiết implementation.
* Chi tiết framework.

Tài liệu này mô tả hệ thống hoạt động như thế nào, không mô tả code được viết ra sao.
