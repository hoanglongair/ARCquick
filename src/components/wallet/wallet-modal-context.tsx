"use client";

import { useState, useCallback, createContext, useContext, ReactNode } from "react";

interface WalletModalContextValue {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const WalletModalContext = createContext<WalletModalContextValue | null>(null);

export function WalletModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  return (
    <WalletModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </WalletModalContext.Provider>
  );
}

export function useWalletModal() {
  const context = useContext(WalletModalContext);
  if (!context) {
    return { isOpen: false, openModal: () => {}, closeModal: () => {} };
  }
  return context;
}
