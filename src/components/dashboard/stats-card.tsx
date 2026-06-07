"use client";

import { useEffect, useRef, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  subValue?: string;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  color?: "primary" | "green" | "yellow" | "purple";
}

export function StatsCard({
  title,
  value,
  subValue,
  trend,
  trendLabel,
  icon,
  color = "primary",
}: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState("0");
  const numericValue = parseFloat(value.replace(/[^0-9.-]/g, ""));
  const isNumeric = !isNaN(numericValue);
  const prevValue = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isNumeric || numericValue === 0) {
      setDisplayValue(value);
      return;
    }

    const start = prevValue.current;
    const end = numericValue;
    const duration = 800;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;

      const prefix = value.match(/^[^0-9-]*/)?.[0] ?? "";
      const suffix = value.match(/[^0-9.-]*$/)?.[0] ?? "";
      setDisplayValue(`${prefix}${current.toLocaleString(undefined, { maximumFractionDigits: 2 })}${suffix}`);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevValue.current = end;
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, isNumeric, numericValue]);

  const colorMap = {
    primary: "border-primary/20",
    green: "border-green-500/20",
    yellow: "border-yellow-500/20",
    purple: "border-purple-500/20",
  };

  const iconBgMap = {
    primary: "bg-primary/10",
    green: "bg-green-500/10",
    yellow: "bg-yellow-500/10",
    purple: "bg-purple-500/10",
  };

  const iconColorMap = {
    primary: "text-primary",
    green: "text-green-500",
    yellow: "text-yellow-500",
    purple: "text-purple-500",
  };

  return (
    <div className={`rounded-xl border bg-card p-5 transition-all hover:border-opacity-60 ${colorMap[color]}`}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        {icon && (
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBgMap[color]}`}>
            <span className={`${iconColorMap[color]}`}>{icon}</span>
          </div>
        )}
      </div>
      <div className="mt-3">
        <span className="text-3xl font-bold">{displayValue}</span>
        {subValue && (
          <span className="ml-2 text-sm text-muted-foreground">{subValue}</span>
        )}
      </div>
      {trend !== undefined && (
        <div className="mt-2 flex items-center gap-1">
          {trend > 0 ? (
            <TrendingUp className="h-3.5 w-3.5 text-green-500" />
          ) : trend < 0 ? (
            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
          ) : (
            <Minus className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span
            className={`text-xs font-medium ${
              trend > 0 ? "text-green-500" : trend < 0 ? "text-red-500" : "text-muted-foreground"
            }`}
          >
            {trend > 0 ? "+" : ""}
            {trend}%
          </span>
          {trendLabel && (
            <span className="text-xs text-muted-foreground">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
