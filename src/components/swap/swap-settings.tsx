"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui";
import { useAppStore } from "@/stores";

interface SwapSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const SLIPPAGE_OPTIONS = [0.1, 0.5, 1.0];

export function SwapSettings({ isOpen, onClose }: SwapSettingsProps) {
  const { slippageTolerance, setSlippageTolerance } = useAppStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md animate-slide-up rounded-t-2xl border-t border-border bg-popover p-6 sm:rounded-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Swap Settings</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-3 block text-sm font-medium text-muted-foreground">
              Slippage Tolerance
            </label>
            <div className="flex gap-2">
              {SLIPPAGE_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => setSlippageTolerance(option)}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    slippageTolerance === option
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
                  value={slippageTolerance}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val > 0 && val <= 50) {
                      setSlippageTolerance(val);
                    }
                  }}
                  className="flex-1 rounded-lg bg-secondary px-3 py-2 pr-8 text-sm font-medium text-center outline-none"
                />
                <span className="absolute right-3 text-sm text-muted-foreground">%</span>
              </div>
            </div>
            {slippageTolerance > 5 && (
              <p className="mt-2 text-xs text-yellow-500">
                High slippage tolerance. You may receive less than expected.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={onClose} className="w-full">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
