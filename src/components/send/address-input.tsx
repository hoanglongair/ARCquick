"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui";
import { CheckCircle, AlertCircle, Copy, QrCode } from "lucide-react";

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  placeholder?: string;
  label?: string;
}

export function AddressInput({
  value,
  onChange,
  onValidationChange,
  placeholder = "0x...",
  label = "Recipient Address",
}: AddressInputProps) {
  const [isTouched, setIsTouched] = useState(false);

  const isValid = /^0x[a-fA-F0-9]{40}$/.test(value);
  const isEmpty = !value;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      onChange(val);
    },
    [onChange]
  );

  const handleBlur = useCallback(() => {
    setIsTouched(true);
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [onValidationChange, isValid]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text);
    } catch {
      // clipboard access denied
    }
  }, [onChange]);

  const showError = isTouched && !isEmpty && !isValid;
  const showSuccess = isTouched && !isEmpty && isValid;

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-muted-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        <Input
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`pr-20 font-mono ${showError ? "border-destructive" : ""} ${showSuccess ? "border-green-500" : ""}`}
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {showSuccess && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          {showError && (
            <AlertCircle className="h-4 w-4 text-destructive" />
          )}
          <button
            type="button"
            onClick={handlePaste}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            title="Paste from clipboard"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>
      {showError && (
        <p className="text-xs text-destructive">Invalid Ethereum address format</p>
      )}
    </div>
  );
}
