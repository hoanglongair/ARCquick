import { create } from "zustand";
import { persist } from "zustand/middleware";

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

  pendingTxs: Record<string, Transaction>;
  addPendingTx: (tx: Transaction) => void;
  removePendingTx: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Transaction history
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

      // UI preferences
      slippageTolerance: 0.5, // 0.5%
      setSlippageTolerance: (value) => set({ slippageTolerance: value }),

      // Pending transactions
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
      }),
    }
  )
);
