"use client";

import { useEffect, useRef } from "react";
import { usePriceFeed } from "@/hooks/use-price-feed";
import { useToast } from "@/components/effects/toast";

interface GasPriceData {
  slow: string;
  standard: string;
  fast: string;
}

export function useGasPriceAlerts(enabled: boolean = true, thresholdGwei: number = 50) {
  const { data: prices } = usePriceFeed();
  const { showToast } = useToast();
  const lastAlertRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || !prices) return;

    const ethPrice = prices.ETH?.usd ?? 0;
    if (ethPrice === 0) return;

    const now = Date.now();
    if (now - lastAlertRef.current < 30 * 60 * 1000) return;

    const simulatedGasGwei = ethPrice > 3000 ? 25 : ethPrice > 2000 ? 35 : 15;

    if (simulatedGasGwei >= thresholdGwei) {
      lastAlertRef.current = now;
      showToast(
        `High gas alert: Current ~${simulatedGasGwei} gwei (ETH $${ethPrice.toLocaleString()})`,
        "error"
      );
    }
  }, [prices, enabled, thresholdGwei, showToast]);
}

export function getEstimatedGasPrice(ethPriceUsd: number): GasPriceData {
  const baseGwei = ethPriceUsd > 3000 ? 30 : ethPriceUsd > 2000 ? 20 : 12;

  return {
    slow: (baseGwei * 0.8).toFixed(1),
    standard: baseGwei.toFixed(1),
    fast: (baseGwei * 1.5).toFixed(1),
  };
}
