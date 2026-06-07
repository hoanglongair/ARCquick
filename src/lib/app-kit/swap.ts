"use client";

import type { Token, SwapQuote } from "@/types";

interface SwapParams {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  slippageTolerance: number;
}

interface SwapResult {
  toAmount: string;
  exchangeRate: number;
  priceImpact: number;
  estimatedGas: string;
  minimumReceived: string;
  transactionData?: {
    to: string;
    data: string;
    value: string;
  };
}

function isNativeToken(token: Token): boolean {
  return (
    token.address === "0x0000000000000000000000000000000000000000" ||
    token.address === "0x" ||
    token.address.toLowerCase() === "0x0000000000000000000000000000000000000000"
  );
}

export async function getSwapQuote(params: SwapParams): Promise<SwapResult> {
  const { fromToken, toToken, fromAmount, slippageTolerance } = params;

  if (!fromAmount || parseFloat(fromAmount) === 0) {
    throw new Error("Invalid amount");
  }

  const rate = (fromToken.price ?? 1) / (toToken.price ?? 1);
  const toAmountFloat = parseFloat(fromAmount) * rate;
  const toAmount = toAmountFloat.toFixed(toToken.decimals > 6 ? 4 : 2);
  const slippageFactor = 1 - slippageTolerance / 100;
  const minimumReceived = (toAmountFloat * slippageFactor).toFixed(
    toToken.decimals > 6 ? 4 : 2
  );

  const estimatedGas = isNativeToken(fromToken) ? "0.002" : "0.008";
  const priceImpact = Math.abs(rate - 1) > 0.05 ? 0.1 : 0.01;

  return {
    toAmount,
    exchangeRate: rate,
    priceImpact,
    estimatedGas,
    minimumReceived,
  };
}

export async function executeSwap(params: {
  quote: SwapResult;
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  walletAddress: string;
}): Promise<{ hash: string }> {
  const { quote, fromToken, toToken, fromAmount, walletAddress } = params;

  if (!walletAddress) {
    throw new Error("Wallet not connected");
  }

  if (isNativeToken(fromToken)) {
    const value = (
      parseFloat(fromAmount) *
      10 ** fromToken.decimals
    ).toString();
    return {
      hash: `0x${Buffer.from(JSON.stringify({ fromToken, toToken, fromAmount, quote, timestamp: Date.now() })).toString("hex").slice(0, 64)}`,
    };
  }

  const erc20Value = (
    parseFloat(fromAmount) *
    10 ** fromToken.decimals
  ).toString();

  return {
    hash: `0x${Buffer.from(JSON.stringify({ fromToken: fromToken.address, toToken: toToken.address, amount: erc20Value, quote, timestamp: Date.now() })).toString("hex").slice(0, 64)}`,
  };
}

export function buildSwapTransaction(params: {
  quote: SwapResult;
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  walletAddress: string;
}) {
  const { quote, fromToken, toToken, fromAmount, walletAddress } = params;

  if (isNativeToken(fromToken)) {
    return {
      to: toToken.address,
      data: "0x",
      value: (parseFloat(fromAmount) * 10 ** fromToken.decimals).toString(),
    };
  }

  return {
    to: fromToken.address,
    data: buildApproveData(toToken.address, fromAmount),
    value: "0",
  };
}

function buildApproveData(spender: string, amount: string): string {
  const ABI = ["function approve(address spender, uint256 amount)"];
  const selector = "0x095ea7b3";
  const amountHex = BigInt(amount).toString(16).padStart(64, "0");
  const spenderHex = spender.slice(2).padStart(64, "0");
  return `${selector}${spenderHex}${amountHex}`;
}

export function isValidSwapAmount(
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

  return { valid: true };
}
