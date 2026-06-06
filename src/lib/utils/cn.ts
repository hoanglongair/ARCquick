"use client";

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 4,
    ...options,
  }).format(value);
}

export function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function parseAmount(value: string, decimals = 18): bigint {
  const [whole, fraction = ""] = value.split(".");
  const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(whole + paddedFraction);
}

export function formatAmount(
  value: bigint,
  decimals = 18,
  displayDecimals = 4
): string {
  const str = value.toString().padStart(decimals + 1, "0");
  const whole = str.slice(0, -decimals) || "0";
  const fraction = str.slice(-decimals).slice(0, displayDecimals);
  return `${whole}.${fraction}`.replace(/\.?0+$/, "");
}
