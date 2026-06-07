"use client";

import { useState, useCallback } from "react";
import type { Token } from "@/types";
import { useSecurityStore, type TxSimulation } from "@/stores/security-store";

export interface SimulationParams {
  type: "swap" | "bridge" | "send";
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount?: string;
  recipientAddress?: string;
  chainId?: number;
}

export interface SimulationResult {
  willSucceed: boolean;
  estimatedGas: string;
  priceImpact: number;
  warnings: string[];
  simulationResult: string;
  tokens: Record<string, { before: string; after: string; delta: string }>;
}

export function useTransactionSimulation() {
  const { addSimulation, settings } = useSecurityStore();
  const [isSimulating, setIsSimulating] = useState(false);

  const simulate = useCallback(
    async (params: SimulationParams): Promise<SimulationResult | null> => {
      if (!settings.simulationEnabled) {
        return null;
      }

      setIsSimulating(true);

      try {
        await new Promise((r) => setTimeout(r, 800));

        const warnings: string[] = [];
        const fromAmountNum = parseFloat(params.fromAmount);
        const gasEstimate = params.fromToken.address === "0x0000000000000000000000000000000000000000"
          ? "0.0025"
          : "0.009";

        if (params.type === "swap") {
          const priceImpact = Math.abs(parseFloat(params.toAmount ?? "0") / fromAmountNum - 1) * 100;
          if (priceImpact > 5) {
            warnings.push(`High price impact: ${priceImpact.toFixed(2)}%`);
          }
          if (fromAmountNum > 10000) {
            warnings.push("Large swap amount detected. Consider splitting into smaller orders.");
          }
        }

        if (params.type === "send" && params.recipientAddress) {
          const isContract = params.recipientAddress.slice(-8) === "00000000";
          if (isContract) {
            warnings.push("This address appears to be a contract. Funds sent to contracts may not be recoverable.");
          }
        }

        if (parseFloat(gasEstimate) > 0.01) {
          warnings.push(`High gas estimate: ~${gasEstimate} ETH`);
        }

        const willSucceed = warnings.filter((w) => w.includes("High")).length === 0;

        const result: SimulationResult = {
          willSucceed,
          estimatedGas: gasEstimate,
          priceImpact: parseFloat(params.toAmount ?? "0") / fromAmountNum * 100 || 0.5,
          warnings,
          simulationResult: willSucceed
            ? "Simulation passed. Transaction is expected to succeed."
            : "Simulation completed with warnings. Review before proceeding.",
          tokens: {
            [params.fromToken.symbol]: {
              before: fromAmountNum.toFixed(6),
              after: "0.000000",
              delta: `-${fromAmountNum.toFixed(6)}`,
            },
            [params.toToken.symbol]: {
              before: "0.000000",
              after: parseFloat(params.toAmount ?? "0").toFixed(6),
              delta: `+${parseFloat(params.toAmount ?? "0").toFixed(6)}`,
            },
          },
        };

        addSimulation({
          type: params.type,
          fromToken: params.fromToken.symbol,
          toToken: params.toToken.symbol,
          fromAmount: params.fromAmount,
          toAmount: params.toAmount ?? params.fromAmount,
          estimatedGas: gasEstimate,
          priceImpact: result.priceImpact,
          willSucceed,
          simulationResult: result.simulationResult,
          warnings,
        });

        return result;
      } finally {
        setIsSimulating(false);
      }
    },
    [settings.simulationEnabled, addSimulation]
  );

  return { simulate, isSimulating };
}
