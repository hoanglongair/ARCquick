"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AlertCondition = "above" | "below";

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: AlertCondition;
  currentPrice: number;
  triggered: boolean;
  createdAt: number;
  triggeredAt?: number;
}

interface PriceAlertState {
  alerts: PriceAlert[];
  addAlert: (alert: Omit<PriceAlert, "id" | "triggered" | "createdAt">) => void;
  removeAlert: (id: string) => void;
  updateAlertTriggered: (id: string, currentPrice: number) => void;
  resetAlert: (id: string) => void;
  clearTriggeredAlerts: () => void;
  getActiveAlerts: () => PriceAlert[];
  getTriggeredAlerts: () => PriceAlert[];
}

export const usePriceAlertStore = create<PriceAlertState>()(
  persist(
    (set, get) => ({
      alerts: [],

      addAlert: (alert) => {
        const newAlert: PriceAlert = {
          ...alert,
          id: crypto.randomUUID(),
          triggered: false,
          createdAt: Date.now(),
        };
        set((state) => ({
          alerts: [...state.alerts, newAlert],
        }));
      },

      removeAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== id),
        }));
      },

      updateAlertTriggered: (id, currentPrice) => {
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id
              ? { ...a, triggered: true, currentPrice, triggeredAt: Date.now() }
              : a
          ),
        }));
      },

      resetAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id
              ? { ...a, triggered: false, triggeredAt: undefined }
              : a
          ),
        }));
      },

      clearTriggeredAlerts: () => {
        set((state) => ({
          alerts: state.alerts.filter((a) => !a.triggered),
        }));
      },

      getActiveAlerts: () => get().alerts.filter((a) => !a.triggered),
      getTriggeredAlerts: () => get().alerts.filter((a) => a.triggered),
    }),
    {
      name: "arcquick-price-alerts",
    }
  )
);
