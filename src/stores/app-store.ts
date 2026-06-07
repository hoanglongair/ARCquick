import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GasPreference = "slow" | "normal" | "fast";
export type ThemePreference = "dark" | "light" | "system";

interface Transaction {
  id: string;
  type: "swap" | "bridge" | "send";
  status: "pending" | "confirmed" | "failed";
  hash?: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  timestamp: number;
  chainId?: number;
}

interface AppState {
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  clearTransactions: () => void;

  slippageTolerance: number;
  setSlippageTolerance: (value: number) => void;

  txDeadline: number;
  setTxDeadline: (minutes: number) => void;

  gasPreference: GasPreference;
  setGasPreference: (pref: GasPreference) => void;

  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;

  pendingTxs: Record<string, Transaction>;
  addPendingTx: (tx: Transaction) => void;
  removePendingTx: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, _get) => ({
      transactions: [],
      addTransaction: (tx) =>
        set((state) => ({
          transactions: [tx, ...state.transactions].slice(0, 100),
        })),
      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id ? { ...tx, ...updates } : tx
          ),
        })),
      clearTransactions: () => set({ transactions: [] }),

      slippageTolerance: 0.5,
      setSlippageTolerance: (value) => set({ slippageTolerance: value }),

      txDeadline: 20,
      setTxDeadline: (minutes) => set({ txDeadline: minutes }),

      gasPreference: "normal",
      setGasPreference: (pref) => set({ gasPreference: pref }),

      theme: "dark",
      setTheme: (_theme) => {},

      pendingTxs: {},
      addPendingTx: (tx) =>
        set((state) => ({
          pendingTxs: { ...state.pendingTxs, [tx.id]: tx },
        })),
      removePendingTx: (id) =>
        set((state) => {
          const { [id]: _, ...rest } = state.pendingTxs;
          return { pendingTxs: rest };
        }),
    }),
    {
      name: "arcquick-storage",
      partialize: (state) => ({
        transactions: state.transactions,
        slippageTolerance: state.slippageTolerance,
        txDeadline: state.txDeadline,
        gasPreference: state.gasPreference,
        theme: state.theme,
      }),
    }
  )
);
