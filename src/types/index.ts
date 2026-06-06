// Token types
export interface Token {
  symbol: string;
  address: string;
  decimals: number;
  name: string;
  icon: string;
  chainId: number;
  price?: number;
}

// Transaction types
export type TransactionType = "swap" | "bridge" | "send";
export type TransactionStatus = "pending" | "confirmed" | "failed";

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  hash?: string;
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  timestamp: number;
  chainId: number;
}

// Swap types
export interface SwapQuote {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  exchangeRate: number;
  priceImpact: number;
  estimatedGas: string;
  minimumReceived: string;
}

// Bridge types
export interface BridgeQuote {
  fromChain: number;
  toChain: number;
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  estimatedTime: string;
  fee: string;
}

// Send types
export interface SendTransaction {
  to: string;
  token: Token;
  amount: string;
  memo?: string;
}
