"use client";

import { useMemo } from "react";

interface QRCodeProps {
  value: string;
  size?: number;
  level?: "L" | "M" | "Q" | "H";
}

export function QRCode({ value, size = 200, level = "M" }: QRCodeProps) {
  const dataUrl = useMemo(() => {
    try {
      const QRCodeLibrary = require("qrcode");
      return QRCodeLibrary.toDataURL(value, {
        width: size,
        margin: 2,
        color: {
          dark: "#e0e0e0",
          light: "#00000000",
        },
        errorCorrectionLevel: level,
      });
    } catch {
      return null;
    }
  }, [value, size, level]);

  if (!dataUrl) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border bg-secondary"
        style={{ width: size, height: size }}
      >
        <p className="text-xs text-muted-foreground">QR Code unavailable</p>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-lg"
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dataUrl} alt="QR Code" className="h-full w-full" />
    </div>
  );
}
