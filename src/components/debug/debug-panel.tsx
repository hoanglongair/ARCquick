"use client";

import { useEffect, useRef, useState } from "react";
import { useDebug } from "./debug-provider";
import { useDebugStore, type LogLevel, type LogSource } from "@/lib/debug-logger";

const SOURCE_COLORS: Record<LogSource, string> = {
  rpc: "hsl(186, 100%, 60%)",
  "tx-send": "hsl(152, 100%, 60%)",
  "tx-swap": "hsl(265, 90%, 65%)",
  "tx-bridge": "hsl(38, 92%, 60%)",
  "tx-watcher": "hsl(0, 84%, 65%)",
  wagmi: "hsl(200, 100%, 65%)",
  app: "hsl(220, 10%, 75%)",
};

const LEVEL_BADGE: Record<LogLevel, { color: string; label: string }> = {
  debug: { color: "hsl(220, 10%, 60%)", label: "DBG" },
  info: { color: "hsl(186, 100%, 50%)", label: "INF" },
  warn: { color: "hsl(38, 92%, 55%)", label: "WRN" },
  error: { color: "hsl(0, 84%, 60%)", label: "ERR" },
};

const ALL_SOURCES: (LogSource | "all")[] = [
  "all",
  "rpc",
  "tx-send",
  "tx-swap",
  "tx-bridge",
  "tx-watcher",
  "wagmi",
  "app",
];

export function DebugPanel() {
  const { enabled, toggle, open, setOpen } = useDebug();
  const entries = useDebugStore((s) => s.entries);
  const clear = useDebugStore((s) => s.clear);
  const dumpToConsole = useDebugStore((s) => s.dumpToConsole);
  const mirrorToTerminal = useDebugStore((s) => s.mirrorToTerminal);
  const setMirrorToTerminal = useDebugStore((s) => s.setMirrorToTerminal);

  const [filter, setFilter] = useState<LogSource | "all">("all");
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  const filtered =
    filter === "all" ? entries : entries.filter((e) => e.source === filter);

  useEffect(() => {
    if (!autoScroll) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [filtered.length, autoScroll]);

  if (!enabled) return null;

  const handleCopy = async () => {
    const text = entries
      .map(
        (e) =>
          `${new Date(e.ts).toISOString()} [${e.source}][${e.level}] ${e.message}` +
          (e.data !== undefined ? ` ${JSON.stringify(e.data)}` : "")
      )
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title={open ? "Hide debug log" : "Show debug log"}
        style={{
          position: "fixed",
          right: "1rem",
          bottom: "1rem",
          zIndex: 200,
          width: "2.75rem",
          height: "2.75rem",
          borderRadius: "9999px",
          background: "hsl(240, 15%, 8%)",
          border: "1px solid hsl(186, 100%, 50%)",
          color: "hsl(186, 100%, 70%)",
          fontWeight: 700,
          fontSize: "1.1rem",
          cursor: "pointer",
          boxShadow: "0 6px 18px rgba(0,0,0,0.45)",
        }}
        aria-label="Toggle debug log"
      >
        ⚙
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Debug log"
          style={{
            position: "fixed",
            right: "1rem",
            bottom: "4.5rem",
            zIndex: 200,
            width: "min(640px, calc(100vw - 2rem))",
            maxHeight: "70vh",
            display: "flex",
            flexDirection: "column",
            background: "hsl(240, 15%, 6%)",
            color: "hsl(220, 10%, 88%)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "0.75rem",
            boxShadow: "0 12px 32px rgba(0,0,0,0.55)",
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
            fontSize: "11.5px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 0.75rem",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <strong style={{ fontSize: "0.75rem" }}>Debug Log</strong>
            <span style={{ opacity: 0.55 }}>· {entries.length}/{250}</span>
            <div style={{ marginLeft: "auto", display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
              {ALL_SOURCES.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  style={{
                    padding: "2px 6px",
                    borderRadius: "4px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background:
                      filter === s ? "rgba(186, 100%, 50%, 0.15)" : "transparent",
                    color:
                      s === "all"
                        ? "hsl(220, 10%, 80%)"
                        : SOURCE_COLORS[s as LogSource],
                    cursor: "pointer",
                    fontSize: "10px",
                    textTransform: "uppercase",
                  }}
                >
                  {s}
                </button>
              ))}
              <button onClick={handleCopy} style={btnStyle}>
                {copied ? "Copied" : "Copy"}
              </button>
              <button onClick={dumpToConsole} style={btnStyle}>
                Dump
              </button>
              <button onClick={clear} style={btnStyle}>
                Clear
              </button>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 10,
                  opacity: 0.85,
                  cursor: "pointer",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  border: `1px solid ${mirrorToTerminal ? "hsl(152, 100%, 50%)" : "rgba(255,255,255,0.12)"}`,
                  color: mirrorToTerminal ? "hsl(152, 100%, 70%)" : "hsl(220, 10%, 80%)",
                  background: mirrorToTerminal ? "rgba(152, 100%, 50%, 0.12)" : "transparent",
                }}
                title="Mirror entries to the dev server terminal (POST /api/debug-log)"
              >
                <input
                  type="checkbox"
                  checked={mirrorToTerminal}
                  onChange={(e) => setMirrorToTerminal(e.target.checked)}
                  style={{ margin: 0 }}
                />
                Terminal
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, opacity: 0.7 }}>
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                />
                auto
              </label>
              <button onClick={toggle} style={{ ...btnStyle, color: "hsl(0, 84%, 65%)" }}>
                Off
              </button>
            </div>
          </div>

          <div
            ref={listRef}
            style={{
              overflowY: "auto",
              padding: "0.5rem",
              minHeight: "200px",
              maxHeight: "calc(70vh - 3.5rem)",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            {filtered.length === 0 && (
              <div style={{ opacity: 0.5, padding: "1rem", textAlign: "center" }}>
                No log entries yet.
              </div>
            )}
            {filtered.map((e) => {
              const lvl = LEVEL_BADGE[e.level];
              const isOpen = !!expanded[e.id];
              const hasData = e.data !== undefined;
              return (
                <div
                  key={e.id}
                  style={{
                    borderRadius: "4px",
                    padding: "4px 6px",
                    background: isOpen ? "rgba(255,255,255,0.03)" : "transparent",
                    cursor: hasData ? "pointer" : "default",
                  }}
                  onClick={() => {
                    if (!hasData) return;
                    setExpanded((p) => ({ ...p, [e.id]: !p[e.id] }));
                  }}
                >
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "baseline" }}>
                    <span style={{ opacity: 0.5, fontSize: 10 }}>
                      {new Date(e.ts).toLocaleTimeString()}
                    </span>
                    <span
                      style={{
                        background: lvl.color,
                        color: "#000",
                        borderRadius: "3px",
                        padding: "0 4px",
                        fontWeight: 700,
                        fontSize: 10,
                      }}
                    >
                      {lvl.label}
                    </span>
                    <span style={{ color: SOURCE_COLORS[e.source], fontWeight: 600 }}>
                      {e.source}
                    </span>
                    <span style={{ flex: 1, wordBreak: "break-word" }}>{e.message}</span>
                  </div>
                  {isOpen && hasData && (
                    <pre
                      style={{
                        margin: "4px 0 0 0",
                        padding: "6px 8px",
                        background: "rgba(0,0,0,0.35)",
                        borderRadius: "4px",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        fontSize: 10.5,
                        maxHeight: 220,
                        overflow: "auto",
                      }}
                    >
                      {typeof e.data === "string"
                        ? e.data
                        : JSON.stringify(e.data, null, 2)}
                    </pre>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "2px 6px",
  borderRadius: "4px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "transparent",
  color: "hsl(220, 10%, 80%)",
  cursor: "pointer",
  fontSize: 10,
};