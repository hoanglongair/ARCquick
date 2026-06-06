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

### Domain Rules

**1. Token Rules**
- Default token: USDC (primary stablecoin on Arc)
- Supported tokens: USDC, EURC, cirBTC (testnet)
- Token balances fetched from Arc RPC
- Prices calculated from exchange rates

**2. Transaction Rules**
- All transactions require wallet connection
- Gas paid in USDC (on Arc)
- Sub-second finality - no waiting for confirmations
- Transaction history stored locally and in database

**3. Bridge Rules**
- Minimum bridge amount: varies by chain
- Bridge fees: ~0 (CCTP) + gas
- Estimated time: depends on destination chain
- Only USDC supported for bridge (testnet)

**4. Security Rules**
- Non-custodial: users control their keys
- No private keys stored
- Transaction signing happens in wallet
- MEV protection via Arc network

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
