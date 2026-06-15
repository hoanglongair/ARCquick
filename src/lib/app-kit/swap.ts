"use client";

import type { Token, SwapQuote } from "@/types";

const NATIVE_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000";

export function isNativeToken(token: Token): boolean {
  return (
    token.address === NATIVE_TOKEN_ADDRESS ||
    token.address === "0x" ||
    token.address.toLowerCase() === NATIVE_TOKEN_ADDRESS
  );
}

export interface SwapResult {
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

interface QuoteParams {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  slippageTolerance: number;
}

export async function getSwapQuote(params: QuoteParams): Promise<SwapResult> {
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
