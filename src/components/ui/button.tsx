"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          // Variants
          {
            "bg-primary text-primary-foreground hover:brightness-110 glow-sm":
              variant === "primary",
            "bg-secondary text-secondary-foreground hover:bg-secondary/80":
              variant === "secondary",
            "border border-border bg-transparent hover:bg-secondary":
              variant === "outline",
            "bg-transparent hover:bg-secondary": variant === "ghost",
            "bg-destructive text-destructive-foreground hover:brightness-110":
              variant === "destructive",
          },
          // Sizes
          {
            "h-8 px-3 text-sm rounded-md": size === "sm",
            "h-10 px-4 text-sm rounded-lg": size === "md",
            "h-12 px-6 text-base rounded-xl": size === "lg",
            "h-10 w-10 rounded-lg": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
