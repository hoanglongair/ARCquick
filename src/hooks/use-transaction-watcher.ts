"use client";

import { useEffect, useCallback, useRef } from "react";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useAppStore } from "@/stores";
import { useToast } from "@/components/effects/toast";

const PENDING_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export function useTransactionWatcher(
  txHash: `0x${string}` | null,
  onComplete?: () => void
) {
  const { updateTransaction, removePendingTx } = useAppStore();
  const { showToast } = useToast();
  const { chainId } = useAccount();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash ?? undefined,
    chainId,
    pollingInterval: 4_000,
    timeout: PENDING_TIMEOUT_MS,
    confirmations: 1,
    query: {
      enabled: !!txHash && !!chainId,
      retry: false,
    },
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleComplete = useCallback(() => {
    if (!txHash) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    removePendingTx(txHash);
    onComplete?.();
  }, [txHash, removePendingTx, onComplete]);

  useEffect(() => {
    if (isSuccess && txHash) {
      showToast("Transaction confirmed on-chain!", "success");
      handleComplete();
    }
  }, [isSuccess, txHash, showToast, handleComplete]);

  useEffect(() => {
    if (isError && txHash) {
      const errMsg = receiptError?.message ?? "";
      const isRpcError =
        errMsg.includes("RPC") ||
        errMsg.includes("rate limit") ||
        errMsg.includes("too many errors") ||
        errMsg.includes("timed out") ||
        errMsg.includes("fetch failed");
      const message = isRpcError
        ? "Network is busy. Your transaction is still valid - check the explorer in a few minutes."
        : "Transaction failed";
      showToast(message, isRpcError ? "warning" : "error");

      if (!isRpcError) {
        updateTransaction(txHash, { status: "failed" });
      }
      removePendingTx(txHash);
      onComplete?.();
    }
  }, [
    isError,
    txHash,
    receiptError,
    showToast,
    updateTransaction,
    removePendingTx,
    onComplete,
  ]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return { isConfirming, isSuccess, isError };
}
