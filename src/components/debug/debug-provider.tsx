"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { useDebugStore, dbg } from "@/lib/debug-logger";

interface DebugContextValue {
  enabled: boolean;
  toggle: () => void;
  setEnabled: (v: boolean) => void;
  log: typeof dbg;
  open: boolean;
  setOpen: (v: boolean) => void;
}

const DebugContext = createContext<DebugContextValue | null>(null);

export function DebugProvider({ children }: { children: ReactNode }) {
  const enabled = useDebugStore((s) => s.enabled);
  const toggle = useDebugStore((s) => s.toggle);
  const setEnabled = useDebugStore((s) => s.setEnabled);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enabled) setOpen(false);
  }, [enabled]);

  const value: DebugContextValue = {
    enabled,
    toggle,
    setEnabled,
    log: dbg,
    open,
    setOpen,
  };

  return <DebugContext.Provider value={value}>{children}</DebugContext.Provider>;
}

export function useDebug(): DebugContextValue {
  const ctx = useContext(DebugContext);
  if (!ctx) {
    return {
      enabled: false,
      toggle: () => {},
      setEnabled: () => {},
      log: dbg,
      open: false,
      setOpen: () => {},
    };
  }
  return ctx;
}

/**
 * Non-context helper - use when you need to log from non-component code
 * (e.g. inside a wagmi transport onResponse callback).
 */
export { dbg } from "@/lib/debug-logger";
export { useDebugStore } from "@/lib/debug-logger";