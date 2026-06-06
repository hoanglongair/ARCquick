"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "outline";
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
          {
            "bg-primary/10 text-primary": variant === "default",
            "bg-success/10 text-success": variant === "success",
            "bg-warning/10 text-warning": variant === "warning",
            "bg-destructive/10 text-destructive": variant === "destructive",
            "border border-border bg-transparent": variant === "outline",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
