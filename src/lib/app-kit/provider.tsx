"use client";

import { createContext, useContext, ReactNode } from "react";
import { SUPPORTED_TOKENS, TOKEN_ALIASES } from "./config";

interface AppKitContextValue {
  supportedTokens: typeof SUPPORTED_TOKENS;
  tokenAliases: typeof TOKEN_ALIASES;
}

const AppKitContext = createContext<AppKitContextValue | null>(null);

interface AppKitProviderProps {
  children: ReactNode;
}

export function AppKitProvider({ children }: AppKitProviderProps) {
  return (
    <AppKitContext.Provider
      value={{
        supportedTokens: SUPPORTED_TOKENS,
        tokenAliases: TOKEN_ALIASES,
      }}
    >
      {children}
    </AppKitContext.Provider>
  );
}

export function useAppKit() {
  const context = useContext(AppKitContext);
  if (!context) {
    throw new Error("useAppKit must be used within AppKitProvider");
  }
  return context;
}
