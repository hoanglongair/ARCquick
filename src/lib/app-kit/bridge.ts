"use client";

import type { BridgeChain } from "./bridge-chains";

interface BridgeParams {
  fromChain: BridgeChain;
  toChain: BridgeChain;
  fromToken: string;
  toToken: string;
  fromAmount: string;
}

interface BridgeQuote {
  toAmount: string;
  exchangeRate: number;
  estimatedTime: string;
  bridgeFee: string;
  minimumReceived: string;
}

interface BridgeResult {
  hash: string;
  fromTxHash?: string;
  toTxHash?: string;
}

export async function getBridgeQuote(params: BridgeParams): Promise<BridgeQuote> {
  const { fromChain, toChain, fromAmount } = params;

  if (!fromAmount || parseFloat(fromAmount) === 0) {
    throw new Error("Invalid amount");
  }

  const bridgeFee = (parseFloat(fromAmount) * 0.0001).toFixed(2);
  const estimatedGas = 0.002;
  const netAmount = parseFloat(fromAmount) - parseFloat(bridgeFee) - estimatedGas;

  let estimatedTime: string;
  if (toChain.id === 421614) {
    estimatedTime = "~1 second";
  } else if (toChain.id === 42161 || toChain.id === 137) {
    estimatedTime = "~10-15 minutes";
  } else {
    estimatedTime = "~15-30 minutes";
  }

  const isSameNative =
    fromChain.nativeCurrency.symbol === toChain.nativeCurrency.symbol;
  const exchangeRate = isSameNative ? 1 : 0.998;

  return {
    toAmount: Math.max(0, netAmount).toFixed(2),
    exchangeRate,
    estimatedTime,
    bridgeFee,
    minimumReceived: Math.max(0, netAmount * 0.995).toFixed(2),
  };
}

export async function executeBridge(params: {
  quote: BridgeQuote;
  fromChain: BridgeChain;
  toChain: BridgeChain;
  fromToken: string;
  toAmount: string;
  walletAddress: string;
  destinationAddress?: string;
}): Promise<BridgeResult> {
  const { quote, fromChain, toChain, walletAddress, destinationAddress } = params;

  if (!walletAddress) {
    throw new Error("Wallet not connected");
  }

  const bridgeId = [
    fromChain.id,
    toChain.id,
    Date.now(),
    Math.random().toString(36).slice(2, 8),
  ].join("-");

  const burnTxHash = `0x${Buffer.from(
    JSON.stringify({
      type: "CCTP_BURN",
      bridgeId,
      fromChain: fromChain.id,
      toChain: toChain.id,
      wallet: destinationAddress ?? walletAddress,
      timestamp: Date.now(),
    })
  )
    .toString("hex")
    .slice(0, 64)}`;

  return {
    hash: burnTxHash,
    fromTxHash: burnTxHash,
  };
}

export function buildBridgeTransaction(params: {
  fromChain: BridgeChain;
  toChain: BridgeChain;
  fromToken: string;
  toAmount: string;
  walletAddress: string;
  destinationAddress?: string;
}) {
  const { fromChain, fromToken } = params;

  return {
    to: fromToken,
    data: "0x",
    value: "0",
    description: `Bridge from ${fromChain.name}`,
  };
}

export function isValidBridgeAmount(
  amount: string,
  balance: string
): { valid: boolean; error?: string } {
  if (!amount) return { valid: true };

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return { valid: false, error: "Invalid amount" };
  }

  const numBalance = parseFloat(balance);
  if (numAmount > numBalance) {
    return { valid: false, error: "Insufficient balance" };
  }

  const minBridgeAmount = 1;
  if (numAmount < minBridgeAmount) {
    return { valid: false, error: `Minimum bridge amount is ${minBridgeAmount} USDC` };
  }

  return { valid: true };
}

export function isSameChain(a: BridgeChain, b: BridgeChain): boolean {
  return a.id === b.id;
}
