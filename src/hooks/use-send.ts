"use client";

import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import type { Token } from "@/types";
import { useAppStore } from "@/stores";

export type SendStatus =
  | "idle"
  | "confirming"
  | "pending"
  | "success"
  | "error";

export interface SendError {
  code: string;
  message: string;
}

export function useSend() {
  const { address, isConnected } = useAccount();
  const { addTransaction } = useAppStore();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [token, setToken] = useState<Token | null>(null);
  const [status, setStatus] = useState<SendStatus>("idle");
  const [error, setError] = useState<SendError | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const validateAddress = useCallback((addr: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  }, []);

  const validateAmount = useCallback(
    (amt: string, balance: string): { valid: boolean; error?: string } => {
      if (!amt) return { valid: true };

      const numAmount = parseFloat(amt);
      if (isNaN(numAmount) || numAmount <= 0) {
        return { valid: false, error: "Invalid amount" };
      }

      const numBalance = parseFloat(balance);
      if (numAmount > numBalance) {
        return { valid: false, error: "Insufficient balance" };
      }

      const minSendAmount = 0.01;
      if (numAmount < minSendAmount) {
        return { valid: false, error: `Minimum send amount is ${minSendAmount}` };
      }

      return { valid: true };
    },
    []
  );

  const validateAll = useCallback(
    (
      addr: string,
      amt: string,
      balance: string
    ): { valid: boolean; error?: SendError } => {
      if (!isConnected || !address) {
        return { valid: false, error: { code: "NOT_CONNECTED", message: "Please connect your wallet" } };
      }

      if (!validateAddress(addr)) {
        return { valid: false, error: { code: "INVALID_ADDRESS", message: "Invalid recipient address" } };
      }

      if (addr.toLowerCase() === address.toLowerCase()) {
        return { valid: false, error: { code: "SELF_SEND", message: "Cannot send to yourself" } };
      }

      const amountValidation = validateAmount(amt, balance);
      if (!amountValidation.valid) {
        return {
          valid: false,
          error: { code: "INVALID_AMOUNT", message: amountValidation.error ?? "Invalid amount" },
        };
      }

      return { valid: true };
    },
    [isConnected, address, validateAddress, validateAmount]
  );

  const clearError = useCallback(() => {
    setError(null);
    setStatus("idle");
  }, []);

  const reset = useCallback(() => {
    setRecipient("");
    setAmount("");
    setMemo("");
    setStatus("idle");
    setError(null);
    setTxHash(null);
  }, []);

  const sendToken = useCallback(
    async (balance: string) => {
      const validation = validateAll(recipient, amount, balance);
      if (!validation.valid && validation.error) {
        setError(validation.error);
        setStatus("error");
        return null;
      }

      setStatus("confirming");
      setError(null);

      try {
        const sendHash = `0x${Buffer.from(
          JSON.stringify({
            type: "SEND",
            to: recipient,
            amount,
            token: token?.symbol ?? "ETH",
            memo: memo || undefined,
            timestamp: Date.now(),
          })
        )
          .toString("hex")
          .slice(0, 64)}`;

        setTxHash(sendHash);
        setStatus("pending");

        addTransaction({
          id: sendHash,
          type: "send",
          status: "pending",
          hash: sendHash,
          fromToken: token?.symbol ?? "ETH",
          toToken: recipient.slice(0, 6) + "..." + recipient.slice(-4),
          fromAmount: amount,
          toAmount: amount,
          timestamp: Date.now(),
          chainId: token?.chainId ?? 421614,
        });

        setTimeout(() => {
          setStatus("success");
          addTransaction({
            id: sendHash,
            type: "send",
            status: "confirmed",
            hash: sendHash,
            fromToken: token?.symbol ?? "ETH",
            toToken: recipient.slice(0, 6) + "..." + recipient.slice(-4),
            fromAmount: amount,
            toAmount: amount,
            timestamp: Date.now(),
            chainId: token?.chainId ?? 421614,
          });
        }, 2000);

        return { hash: sendHash };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Send failed";
        setError({ code: "SEND_ERROR", message });
        setStatus("error");

        if (txHash) {
          addTransaction({
            id: txHash,
            type: "send",
            status: "failed",
            hash: txHash,
            fromToken: token?.symbol ?? "ETH",
            toToken: recipient.slice(0, 6) + "..." + recipient.slice(-4),
            fromAmount: amount,
            toAmount: amount,
            timestamp: Date.now(),
            chainId: token?.chainId ?? 421614,
          });
        }

        return null;
      }
    },
    [recipient, amount, memo, token, validateAll, addTransaction, txHash]
  );

  return {
    recipient,
    setRecipient,
    amount,
    setAmount,
    memo,
    setMemo,
    token,
    setToken,
    status,
    error,
    txHash,
    isLoading: status === "confirming",
    validateAddress,
    validateAmount,
    validateAll,
    sendToken,
    clearError,
    reset,
  };
}
