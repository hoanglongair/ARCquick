"use client";

import { useEffect } from "react";
import { usePriceFeed } from "@/hooks/use-price-feed";
import { usePriceAlertStore } from "@/stores/price-alert-store";
import { useToast } from "@/components/effects/toast";

export function usePriceAlertChecker() {
  const { data: prices } = usePriceFeed();
  const { alerts, updateAlertTriggered, getActiveAlerts } = usePriceAlertStore();
  const { showToast } = useToast();

  useEffect(() => {
    if (!prices) return;

    const activeAlerts = getActiveAlerts();

    for (const alert of activeAlerts) {
      const price = prices[alert.symbol];
      if (!price) continue;

      const shouldTrigger =
        (alert.condition === "above" && price.usd >= alert.targetPrice) ||
        (alert.condition === "below" && price.usd <= alert.targetPrice);

      if (shouldTrigger) {
        updateAlertTriggered(alert.id, price.usd);

        const direction = alert.condition === "above" ? "rose above" : "fell below";
        showToast(
          `${alert.symbol} ${direction} $${alert.targetPrice.toLocaleString()} (now: $${price.usd.toLocaleString()})`,
          "info"
        );
      }
    }
  }, [prices, alerts, updateAlertTriggered, getActiveAlerts, showToast]);
}
