"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WhitelistedAddress {
  id: string;
  label: string;
  address: string;
  chainId?: number;
  createdAt: number;
  lastUsedAt?: number;
}

export interface DailyLimit {
  token: string;
  chainId: number;
  dailyUsdLimit: number;
  usedToday: number;
  resetAt: number;
}

export interface SecuritySettings {
  simulationEnabled: boolean;
  whitelistEnabled: boolean;
  dailyLimitEnabled: boolean;
  anomalyAlertsEnabled: boolean;
  gasAlertEnabled: boolean;
  gasAlertThreshold: number;
  defaultDailyLimitUsd: number;
}

export interface TxSimulation {
  id: string;
  type: "swap" | "bridge" | "send";
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  estimatedGas: string;
  priceImpact: number;
  willSucceed: boolean;
  simulationResult?: string;
  warnings: string[];
  createdAt: number;
}

interface SecurityState {
  whitelistedAddresses: WhitelistedAddress[];
  dailyLimits: DailyLimit[];
  settings: SecuritySettings;
  recentSimulations: TxSimulation[];

  addWhitelistedAddress: (address: Omit<WhitelistedAddress, "id" | "createdAt">) => void;
  removeWhitelistedAddress: (id: string) => void;
  updateWhitelistedAddress: (id: string, updates: Partial<WhitelistedAddress>) => void;
  isAddressWhitelisted: (address: string) => boolean;

  setDailyLimit: (limit: Omit<DailyLimit, "usedToday" | "resetAt">) => void;
  checkDailyLimit: (token: string, chainId: number, amountUsd: number) => { allowed: boolean; remaining: number; };
  resetDailyUsage: (token: string, chainId: number) => void;
  recordDailyUsage: (token: string, chainId: number, amountUsd: number) => void;

  updateSettings: (updates: Partial<SecuritySettings>) => void;

  addSimulation: (sim: Omit<TxSimulation, "id" | "createdAt">) => void;
  clearSimulations: () => void;
}

const defaultSettings: SecuritySettings = {
  simulationEnabled: false,
  whitelistEnabled: false,
  dailyLimitEnabled: false,
  anomalyAlertsEnabled: true,
  gasAlertEnabled: true,
  gasAlertThreshold: 50,
  defaultDailyLimitUsd: 10000,
};

function getDayResetTimestamp(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime();
}

export const useSecurityStore = create<SecurityState>()(
  persist(
    (set, get) => ({
      whitelistedAddresses: [],
      dailyLimits: [],
      settings: defaultSettings,
      recentSimulations: [],

      addWhitelistedAddress: (address) => {
        const newAddr: WhitelistedAddress = {
          ...address,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        };
        set((state) => ({
          whitelistedAddresses: [...state.whitelistedAddresses, newAddr],
        }));
      },

      removeWhitelistedAddress: (id) => {
        set((state) => ({
          whitelistedAddresses: state.whitelistedAddresses.filter((a) => a.id !== id),
        }));
      },

      updateWhitelistedAddress: (id, updates) => {
        set((state) => ({
          whitelistedAddresses: state.whitelistedAddresses.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        }));
      },

      isAddressWhitelisted: (address) => {
        return get().whitelistedAddresses.some(
          (a) => a.address.toLowerCase() === address.toLowerCase()
        );
      },

      setDailyLimit: (limit) => {
        set((state) => {
          const existing = state.dailyLimits.findIndex(
            (l) => l.token === limit.token && l.chainId === limit.chainId
          );
          const newLimit: DailyLimit = {
            ...limit,
            usedToday: 0,
            resetAt: getDayResetTimestamp(),
          };
          if (existing >= 0) {
            const updated = [...state.dailyLimits];
            updated[existing] = newLimit;
            return { dailyLimits: updated };
          }
          return { dailyLimits: [...state.dailyLimits, newLimit] };
        });
      },

      checkDailyLimit: (token, chainId, amountUsd) => {
        const now = Date.now();
        const limits = get().dailyLimits;
        const limit = limits.find((l) => l.token === token && l.chainId === chainId);

        if (!limit || limit.resetAt <= now) {
          return { allowed: true, remaining: get().settings.defaultDailyLimitUsd };
        }

        const remaining = limit.dailyUsdLimit - limit.usedToday;
        return {
          allowed: amountUsd <= remaining,
          remaining: Math.max(0, remaining),
        };
      },

      resetDailyUsage: (token, chainId) => {
        set((state) => ({
          dailyLimits: state.dailyLimits.map((l) =>
            l.token === token && l.chainId === chainId
              ? { ...l, usedToday: 0, resetAt: getDayResetTimestamp() }
              : l
          ),
        }));
      },

      recordDailyUsage: (token, chainId, amountUsd) => {
        const now = Date.now();
        set((state) => {
          const existing = state.dailyLimits.findIndex(
            (l) => l.token === token && l.chainId === chainId
          );
          if (existing >= 0) {
            const updated = [...state.dailyLimits];
            if (updated[existing].resetAt <= now) {
              updated[existing] = {
                ...updated[existing],
                usedToday: amountUsd,
                resetAt: getDayResetTimestamp(),
              };
            } else {
              updated[existing] = {
                ...updated[existing],
                usedToday: updated[existing].usedToday + amountUsd,
              };
            }
            return { dailyLimits: updated };
          }
          return {
            dailyLimits: [
              ...state.dailyLimits,
              { token, chainId, dailyUsdLimit: state.settings.defaultDailyLimitUsd, usedToday: amountUsd, resetAt: getDayResetTimestamp() },
            ],
          };
        });
      },

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      addSimulation: (sim) => {
        const newSim: TxSimulation = {
          ...sim,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        };
        set((state) => ({
          recentSimulations: [newSim, ...state.recentSimulations].slice(0, 20),
        }));
      },

      clearSimulations: () => set({ recentSimulations: [] }),
    }),
    {
      name: "arcquick-security",
    }
  )
);
