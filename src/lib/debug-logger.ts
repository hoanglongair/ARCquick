"use client";

import { create } from "zustand";

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogSource =
  | "rpc"
  | "tx-send"
  | "tx-swap"
  | "tx-bridge"
  | "tx-watcher"
  | "wagmi"
  | "app";

export interface LogEntry {
  id: number;
  ts: number;
  level: LogLevel;
  source: LogSource;
  message: string;
  data?: unknown;
}

interface DebugState {
  enabled: boolean;
  mirrorToTerminal: boolean;
  entries: LogEntry[];
  setEnabled: (v: boolean) => void;
  setMirrorToTerminal: (v: boolean) => void;
  toggle: () => void;
  push: (entry: Omit<LogEntry, "id" | "ts">) => void;
  clear: () => void;
  dumpToConsole: () => void;
}

const MAX_ENTRIES = 250;
let nextId = 1;

function isBrowser() {
  return typeof window !== "undefined";
}

function readBool(key: string, fallback = false): boolean {
  if (!isBrowser()) return fallback;
  try {
    const v = window.localStorage.getItem(key);
    if (v === "1") return true;
    if (v === "0") return false;
    return fallback;
  } catch {
    return fallback;
  }
}

function defaultEnabled(): boolean {
  if (!isBrowser()) return false;
  if (process.env.NEXT_PUBLIC_DEBUG === "1") return true;
  return readBool("arcquick.debug");
}

function defaultMirror(): boolean {
  if (!isBrowser()) return false;
  if (process.env.NEXT_PUBLIC_DEBUG_TERMINAL === "1") return true;
  return readBool("arcquick.debug.terminal");
}

function persist(key: string, v: boolean) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, v ? "1" : "0");
  } catch {
    /* ignore */
  }
}

function postToTerminal(entries: Array<Omit<LogEntry, "id" | "ts">>) {
  if (!isBrowser()) return;
  if (entries.length === 0) return;
  const payload = JSON.stringify(entries);
  let sent = false;
  try {
    if (
      "sendBeacon" in navigator &&
      typeof navigator.sendBeacon === "function"
    ) {
      try {
        const blob = new Blob([payload], { type: "application/json" });
        sent = navigator.sendBeacon("/api/debug-log", blob);
      } catch {
        sent = false;
      }
    }
    if (!sent) {
      void fetch("/api/debug-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {
        /* swallow - this is a best-effort mirror */
      });
    }
  } catch {
    /* ignore */
  }
}

export const useDebugStore = create<DebugState>((set, get) => ({
  enabled: defaultEnabled(),
  mirrorToTerminal: defaultMirror(),
  entries: [],
  setEnabled: (v) => {
    persist("arcquick.debug", v);
    set({ enabled: v });
  },
  setMirrorToTerminal: (v) => {
    persist("arcquick.debug.terminal", v);
    set({ mirrorToTerminal: v });
  },
  toggle: () => {
    const v = !get().enabled;
    persist("arcquick.debug", v);
    set({ enabled: v });
  },
  push: (entry) => {
    const full: LogEntry = { ...entry, id: nextId++, ts: Date.now() };
    const next = [...get().entries, full];
    if (next.length > MAX_ENTRIES) next.splice(0, next.length - MAX_ENTRIES);
    set({ entries: next });

    if (get().mirrorToTerminal) {
      postToTerminal([{ source: entry.source, level: entry.level, message: entry.message, data: entry.data }]);
    }

    if (!isBrowser()) return;
    const tag = `[arcquick][${entry.source}][${entry.level}]`;
    const consoleArgs: unknown[] = [
      tag,
      entry.message,
      entry.data === undefined ? "" : entry.data,
    ];
    switch (entry.level) {
      case "error":
        console.error(...consoleArgs);
        break;
      case "warn":
        console.warn(...consoleArgs);
        break;
      case "info":
        console.info(...consoleArgs);
        break;
      default:
        console.debug(...consoleArgs);
    }
  },
  clear: () => set({ entries: [] }),
  dumpToConsole: () => {
    const entries = get().entries;
    // eslint-disable-next-line no-console
    console.table(
      entries.map((e) => ({
        ts: new Date(e.ts).toISOString(),
        level: e.level,
        source: e.source,
        message: e.message,
        data: e.data === undefined ? "" : JSON.stringify(e.data).slice(0, 200),
      }))
    );
  },
}));

/**
 * Fire-and-forget helper. Cheap no-op when debug is disabled (error
 * level still surfaces to console so we never lose real problems).
 */
export function dbg(
  source: LogSource,
  level: LogLevel,
  message: string,
  data?: unknown
) {
  const { enabled, push } = useDebugStore.getState();
  if (!enabled) {
    if (level === "error" && typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.error(`[arcquick][${source}] ${message}`, data ?? "");
    }
    return;
  }
  push({ source, level, message, data });
}
