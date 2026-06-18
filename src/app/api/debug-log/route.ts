import { NextResponse } from "next/server";

/**
 * Server-side sink for browser-side debug entries.
 *
 * Client `dbg()` POSTs each entry here (only when the debug pill is on,
 * or when the user explicitly enables terminal mirror). The handler
 * prints a single line per entry to the Next dev server stdout, which
 * appears in the terminal that ran `npm run dev`.
 *
 * Kept intentionally tiny and unauthenticated: debug logs are not
 * security-sensitive (no addresses, no balances, no tx bodies), and the
 * endpoint is rate-limited by Next dev defaults.
 */
export const dynamic = "force-dynamic";

interface IncomingEntry {
  source?: string;
  level?: string;
  message?: string;
  data?: unknown;
  ts?: number;
}

const ALLOWED_LEVELS = new Set(["debug", "info", "warn", "error"]);
const MAX_DATA_CHARS = 400;

function safeStringify(data: unknown): string {
  if (data === undefined) return "";
  if (typeof data === "string") return data.slice(0, MAX_DATA_CHARS);
  try {
    return JSON.stringify(data).slice(0, MAX_DATA_CHARS);
  } catch {
    return "[unserialisable]";
  }
}

export async function POST(req: Request) {
  let payload: IncomingEntry | IncomingEntry[];
  try {
    payload = (await req.json()) as IncomingEntry | IncomingEntry[];
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const entries = Array.isArray(payload) ? payload : [payload];
  const ts = Date.now();

  for (const raw of entries) {
    const source = String(raw?.source ?? "app").padEnd(12);
    const level = ALLOWED_LEVELS.has(String(raw?.level))
      ? String(raw.level).toUpperCase().padEnd(5)
      : "DEBUG";
    const message = String(raw?.message ?? "");
    const data = safeStringify(raw?.data);
    const line = `[arcquick][${source}][${level}] ${message}${data ? " " + data : ""}`;
    // eslint-disable-next-line no-console
    console.log(line);
  }

  return NextResponse.json({ ok: true, echoed: entries.length, ts });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    usage:
      "POST { source, level, message, data } to mirror browser debug entries to this terminal.",
  });
}
