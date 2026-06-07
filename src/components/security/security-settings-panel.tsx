"use client";

import { useState } from "react";
import { Shield, AlertTriangle, Clock, Users, Bell, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui";
import { useSecurityStore, type WhitelistedAddress } from "@/stores/security-store";
import { useAccount } from "wagmi";

interface SecuritySettingsPanelProps {
  onClose?: () => void;
}

export function SecuritySettingsPanel({ onClose }: SecuritySettingsPanelProps) {
  return (
    <div className="space-y-6">
      <SimulationSection />
      <WhitelistSection />
      <DailyLimitSection />
      <AnomalySection />
      <GasAlertSection />
    </div>
  );
}

function SimulationSection() {
  const { settings, updateSettings, recentSimulations, clearSimulations } = useSecurityStore();
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
            <TrendingDown className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold">Transaction Simulation</h3>
            <p className="text-xs text-muted-foreground">Preview txs before signing</p>
          </div>
        </div>
        <ToggleSwitch
          enabled={settings.simulationEnabled}
          onToggle={(v) => updateSettings({ simulationEnabled: v })}
        />
      </button>

      {expanded && settings.simulationEnabled && (
        <div className="mt-4 space-y-3">
          <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-3">
            <p className="text-xs text-blue-300">
              Simulation will run before each transaction, showing estimated gas, price impact, and warnings.
              Enable to review transactions before signing.
            </p>
          </div>
          {recentSimulations.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Recent Simulations</p>
                <button
                  onClick={clearSimulations}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              </div>
              {recentSimulations.slice(0, 3).map((sim) => (
                <div key={sim.id} className="flex items-center justify-between rounded-lg bg-secondary/50 p-2 text-xs">
                  <div>
                    <span className="font-medium">{sim.type.toUpperCase()}</span>
                    <span className="ml-2 text-muted-foreground">
                      {sim.fromAmount} {sim.fromToken} → {sim.toAmount} {sim.toToken}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {sim.willSucceed ? (
                      <span className="text-green-400">Passed</span>
                    ) : (
                      <span className="text-yellow-400">{sim.warnings.length} warnings</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WhitelistSection() {
  const { settings, updateSettings, whitelistedAddresses, addWhitelistedAddress, removeWhitelistedAddress } = useSecurityStore();
  const { address } = useAccount();
  const [expanded, setExpanded] = useState(false);
  const [label, setLabel] = useState("");
  const [addr, setAddr] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    setError("");
    if (!addr.trim()) { setError("Enter an address"); return; }
    if (!/^0x[a-fA-F0-9]{40}$/.test(addr.trim())) { setError("Invalid Ethereum address"); return; }
    addWhitelistedAddress({ label: label.trim() || addr.slice(0, 8), address: addr.trim().toLowerCase() });
    setAddr("");
    setLabel("");
  };

  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10">
            <Users className="h-4 w-4 text-green-400" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold">Address Whitelist</h3>
            <p className="text-xs text-muted-foreground">Approved recipient list</p>
          </div>
        </div>
        <ToggleSwitch
          enabled={settings.whitelistEnabled}
          onToggle={(v) => updateSettings({ whitelistEnabled: v })}
        />
      </button>

      {expanded && (
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Label (optional)"
              className="flex-1 rounded-lg bg-secondary px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <input
              value={addr}
              onChange={(e) => { setAddr(e.target.value); setError(""); }}
              placeholder="0x..."
              className="flex-[2] rounded-lg bg-secondary px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button onClick={handleAdd} size="sm" className="px-3">Add</Button>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}

          {whitelistedAddresses.length > 0 ? (
            <div className="space-y-1.5">
              {whitelistedAddresses.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">{a.label}</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {a.address.slice(0, 6)}...{a.address.slice(-4)}
                    </span>
                  </div>
                  <button
                    onClick={() => removeWhitelistedAddress(a.id)}
                    className="text-xs text-muted-foreground hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">
              No whitelisted addresses yet
            </p>
          )}

          <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-3">
            <p className="text-xs text-green-300">
              When enabled, transactions to non-whitelisted addresses will show a warning before signing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function DailyLimitSection() {
  const { settings, updateSettings, dailyLimits, setDailyLimit, checkDailyLimit } = useSecurityStore();
  const [expanded, setExpanded] = useState(false);
  const [limitUsd, setLimitUsd] = useState(String(settings.defaultDailyLimitUsd));

  const ethLimit = dailyLimits.find((l) => l.token === "ETH");
  const now = Date.now();
  const resetIn = ethLimit ? Math.max(0, ethLimit.resetAt - now) : 0;
  const resetHours = Math.ceil(resetIn / (60 * 60 * 1000));

  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10">
            <Clock className="h-4 w-4 text-orange-400" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold">Daily Limits</h3>
            <p className="text-xs text-muted-foreground">Cap daily transfers</p>
          </div>
        </div>
        <ToggleSwitch
          enabled={settings.dailyLimitEnabled}
          onToggle={(v) => updateSettings({ dailyLimitEnabled: v })}
        />
      </button>

      {expanded && settings.dailyLimitEnabled && (
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Daily limit (USD)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <input
                  type="number"
                  value={limitUsd}
                  onChange={(e) => {
                    setLimitUsd(e.target.value);
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val > 0) {
                      updateSettings({ defaultDailyLimitUsd: val });
                      setDailyLimit({ token: "ETH", chainId: 421614, dailyUsdLimit: val });
                    }
                  }}
                  className="w-full rounded-lg bg-secondary pl-7 pr-3 py-2 text-sm outline-none"
                />
              </div>
            </div>
          </div>

          {ethLimit && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Used today</span>
                <span>${ethLimit.usedToday.toFixed(2)} / ${ethLimit.dailyUsdLimit.toLocaleString()}</span>
              </div>
              <div className="w-full rounded-full bg-secondary h-1.5">
                <div
                  className="h-1.5 rounded-full bg-orange-400 transition-all"
                  style={{ width: `${Math.min(100, (ethLimit.usedToday / ethLimit.dailyUsdLimit) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Resets in ~{resetHours}h
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AnomalySection() {
  const { settings, updateSettings } = useSecurityStore();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10">
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold">Anomaly Detection</h3>
            <p className="text-xs text-muted-foreground">Alerts for unusual activity</p>
          </div>
        </div>
        <ToggleSwitch
          enabled={settings.anomalyAlertsEnabled}
          onToggle={(v) => updateSettings({ anomalyAlertsEnabled: v })}
        />
      </button>

      {expanded && (
        <div className="mt-4 space-y-2">
          <p className="text-xs text-muted-foreground">
            Alerts when detecting:
          </p>
          {[
            { name: "Large Transaction", desc: "Tx value exceeds 2x daily average" },
            { name: "New Recipient", desc: "First send to an address" },
            { name: "Unusual Timing", desc: "Tx initiated outside typical hours" },
            { name: "Rate Limit", desc: "Multiple txs in quick succession" },
          ].map((rule) => (
            <div key={rule.name} className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
              <AlertTriangle className="h-3.5 w-3.5 text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium">{rule.name}</p>
                <p className="text-xs text-muted-foreground">{rule.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GasAlertSection() {
  const { settings, updateSettings } = useSecurityStore();
  const [expanded, setExpanded] = useState(false);
  const [threshold, setThreshold] = useState(String(settings.gasAlertThreshold));

  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-500/10">
            <Bell className="h-4 w-4 text-yellow-400" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold">Gas Price Alerts</h3>
            <p className="text-xs text-muted-foreground">Notify when gas is high</p>
          </div>
        </div>
        <ToggleSwitch
          enabled={settings.gasAlertEnabled}
          onToggle={(v) => updateSettings({ gasAlertEnabled: v })}
        />
      </button>

      {expanded && settings.gasAlertEnabled && (
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Alert threshold (gwei)</label>
            <div className="relative flex-1">
              <input
                type="number"
                value={threshold}
                onChange={(e) => {
                  setThreshold(e.target.value);
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val > 0) {
                    updateSettings({ gasAlertThreshold: val });
                  }
                }}
                className="w-full rounded-lg bg-secondary px-3 py-2 text-sm outline-none pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">gwei</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Alert when estimated gas exceeds this threshold
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleSwitch({ enabled, onToggle }: { enabled: boolean; onToggle: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onToggle(!enabled)}
      className={`relative h-6 w-11 rounded-full transition-colors ${
        enabled ? "bg-cyan-500" : "bg-secondary"
      }`}
    >
      <div
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          enabled ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
