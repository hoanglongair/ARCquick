"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type OrderType = "limit" | "twap";
export type OrderStatus = "pending" | "executing" | "completed" | "cancelled" | "failed";
export type OrderSide = "buy" | "sell";

export interface LimitOrder {
  id: string;
  type: "limit";
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  targetPrice: number;
  currentPrice: number;
  side: OrderSide;
  status: "pending" | "executing" | "completed" | "cancelled" | "failed";
  createdAt: number;
  executedAt?: number;
  executedPrice?: number;
  txHash?: string;
  expiresAt: number;
}

export interface TwapOrder {
  id: string;
  type: "twap";
  fromToken: string;
  toToken: string;
  totalAmount: string;
  trancheCount: number;
  trancheIntervalMinutes: number;
  filledAmount: string;
  status: "pending" | "executing" | "completed" | "cancelled" | "failed";
  createdAt: number;
  lastExecutedAt?: number;
  nextExecutionAt?: number;
  txHashes: string[];
  expiresAt: number;
}

type AdvancedOrder = LimitOrder | TwapOrder;

interface AdvancedTradingState {
  limitOrders: LimitOrder[];
  twapOrders: TwapOrder[];

  addLimitOrder: (order: Omit<LimitOrder, "id" | "status" | "createdAt" | "currentPrice" | "type" | "filledAmount" | "txHashes">) => void;
  updateLimitOrder: (id: string, updates: Partial<LimitOrder>) => void;
  cancelLimitOrder: (id: string) => void;
  removeLimitOrder: (id: string) => void;

  addTwapOrder: (order: Omit<TwapOrder, "id" | "status" | "type" | "createdAt" | "filledAmount" | "lastExecutedAt" | "nextExecutionAt" | "txHashes">) => void;
  updateTwapOrder: (id: string, updates: Partial<TwapOrder>) => void;
  cancelTwapOrder: (id: string) => void;
  removeTwapOrder: (id: string) => void;

  getActiveLimitOrders: () => LimitOrder[];
  getActiveTwapOrders: () => TwapOrder[];
  getPendingOrders: () => AdvancedOrder[];
}

export const useAdvancedTradingStore = create<AdvancedTradingState>()(
  persist(
    (set, get) => ({
      limitOrders: [],
      twapOrders: [],

      addLimitOrder: (order) => {
        const newOrder: LimitOrder = {
          ...order,
          type: "limit",
          id: crypto.randomUUID(),
          status: "pending",
          createdAt: Date.now(),
          currentPrice: 0,
        };
        set((state) => ({
          limitOrders: [newOrder, ...state.limitOrders],
        }));
      },

      updateLimitOrder: (id, updates) => {
        set((state) => ({
          limitOrders: state.limitOrders.map((o) =>
            o.id === id ? { ...o, ...updates } : o
          ),
        }));
      },

      cancelLimitOrder: (id) => {
        set((state) => ({
          limitOrders: state.limitOrders.map((o) =>
            o.id === id ? { ...o, status: "cancelled" } : o
          ),
        }));
      },

      removeLimitOrder: (id) => {
        set((state) => ({
          limitOrders: state.limitOrders.filter((o) => o.id !== id),
        }));
      },

      addTwapOrder: (order) => {
        const newOrder: TwapOrder = {
          ...order,
          type: "twap",
          id: crypto.randomUUID(),
          status: "pending",
          createdAt: Date.now(),
          filledAmount: "0",
          nextExecutionAt: Date.now() + order.trancheIntervalMinutes * 60 * 1000,
          txHashes: [],
        };
        set((state) => ({
          twapOrders: [newOrder, ...state.twapOrders],
        }));
      },

      updateTwapOrder: (id, updates) => {
        set((state) => ({
          twapOrders: state.twapOrders.map((o) =>
            o.id === id ? { ...o, ...updates } : o
          ),
        }));
      },

      cancelTwapOrder: (id) => {
        set((state) => ({
          twapOrders: state.twapOrders.map((o) =>
            o.id === id ? { ...o, status: "cancelled" } : o
          ),
        }));
      },

      removeTwapOrder: (id) => {
        set((state) => ({
          twapOrders: state.twapOrders.filter((o) => o.id !== id),
        }));
      },

      getActiveLimitOrders: () => get().limitOrders.filter((o) => o.status === "pending"),
      getActiveTwapOrders: () => get().twapOrders.filter((o) => o.status === "pending" || o.status === "executing"),
      getPendingOrders: () => [
        ...get().limitOrders.filter((o) => o.status === "pending"),
        ...get().twapOrders.filter((o) => o.status === "pending" || o.status === "executing"),
      ],
    }),
    {
      name: "arcquick-advanced-trading",
    }
  )
);
