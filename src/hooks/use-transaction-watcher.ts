"use client";

import { useEffect, useCallback } from "react";
import { useWaitForTransactionReceipt, useWatchContractEvent } from "wagmi";
import { useAppStore } from "@/stores";
import { useToast } from "@/components/effects/toast";

export function useTransactionWatcher(txHash: `0x${string}` | null, onComplete?: () => void) {
  const { updateTransaction, removePendingTx } = useAppStore();
  const { showToast } = useToast();

  const { isLoading: isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({
    hash: txHash ?? undefined,
    pollingInterval: 2_000,
    query: {
      enabled: !!txHash,
    },
  });

  const handleComplete = useCallback(() => {
    if (!txHash) return;
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
      showToast("Transaction failed", "error");
      updateTransaction(txHash, { status: "failed" });
      removePendingTx(txHash);
      onComplete?.();
    }
  }, [isError, txHash, showToast, updateTransaction, removePendingTx, onComplete]);

  return { isConfirming, isSuccess, isError };
}
