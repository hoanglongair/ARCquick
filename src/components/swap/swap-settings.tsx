"use client";

import { useState } from "react";
import { X, Fuel, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui";
import { useAppStore } from "@/stores";

interface SwapSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const SLIPPAGE_OPTIONS = [0.1, 0.5, 1.0];

export type GasPreference = "slow" | "normal" | "fast";

export function SwapSettings({ isOpen, onClose }: SwapSettingsProps) {
  const {
    slippageTolerance,
    setSlippageTolerance,
    gasPreference,
    setGasPreference,
    txDeadline,
    setTxDeadline,
  } = useAppStore();

  const [localSlippage, setLocalSlippage] = useState(slippageTolerance);
  const [localDeadline, setLocalDeadline] = useState(txDeadline);
  const [activeTab, setActiveTab] = useState<"swap" | "advanced">("swap");

  const handleSave = () => {
    setSlippageTolerance(localSlippage);
    setTxDeadline(localDeadline);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md animate-slide-up rounded-t-2xl border-t border-border bg-popover p-6 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 flex gap-1 rounded-lg bg-secondary p-1">
          <button
            onClick={() => setActiveTab("swap")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "swap"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            Swap
          </button>
          <button
            onClick={() => setActiveTab("advanced")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "advanced"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            Advanced
          </button>
        </div>

        {activeTab === "swap" && (
          <div className="space-y-4">
            <div>
              <label className="mb-3 block text-sm font-medium text-muted-foreground">
                Slippage Tolerance
              </label>
              <div className="flex gap-2">
                {SLIPPAGE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => setLocalSlippage(option)}
                    className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      localSlippage === option
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    {option}%
                  </button>
                ))}
                <div className="relative flex flex-1 items-center">
                  <input
                    type="number"
                    step="0.1"
                    min="0.01"
                    max="50"
                    value={localSlippage}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val > 0 && val <= 50) {
                        setLocalSlippage(val);
                      }
                    }}
                    className="flex-1 rounded-lg bg-secondary px-3 py-2 pr-8 text-sm font-medium text-center outline-none"
                  />
                  <span className="absolute right-3 text-sm text-muted-foreground">%</span>
                </div>
              </div>
              {localSlippage > 5 && (
                <p className="mt-2 text-xs text-yellow-500">
                  High slippage tolerance. You may receive less than expected.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "advanced" && (
          <div className="space-y-4">
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Clock className="h-4 w-4" />
                Transaction Deadline
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={localDeadline}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val > 0 && val <= 60) {
                      setLocalDeadline(val);
                    }
                  }}
                  className="flex-1 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-center outline-none"
                />
                <span className="text-sm text-muted-foreground">minutes</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Transaction will revert if pending longer than this
              </p>
            </div>

            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Fuel className="h-4 w-4" />
                Gas Preference
              </label>
              <div className="flex gap-2">
                {(["slow", "normal", "fast"] as GasPreference[]).map((pref) => (
                  <button
                    key={pref}
                    onClick={() => setGasPreference(pref)}
                    className={`flex flex-1 flex-col items-center gap-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      gasPreference === pref
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    {pref === "slow" && <Zap className="h-4 w-4" />}
                    {pref === "normal" && <Zap className="h-4 w-4" />}
                    {pref === "fast" && <Zap className="h-4 w-4" />}
                    {pref.charAt(0).toUpperCase() + pref.slice(1)}
                    {pref === "slow" && (
                      <span className="text-[10px] opacity-70">Cheap</span>
                    )}
                    {pref === "normal" && (
                      <span className="text-[10px] opacity-70">Standard</span>
                    )}
                    {pref === "fast" && (
                      <span className="text-[10px] opacity-70">Priority</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <Button onClick={handleSave} className="w-full">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
