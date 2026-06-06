import type { Metadata } from "next";
import { Syne, DM_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { CursorEffects, CanvasBackground } from "@/components/effects";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ARCquick - Testnet Token Exchange",
  description:
    "The next-generation decentralized exchange for testnet tokens. Lightning-fast swaps, deep liquidity, and zero compromises.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${dmMono.variable}`}>
      <body className="min-h-screen bg-background font-sans">
        <Providers>
          <CursorEffects />
          <CanvasBackground />
          {children}
        </Providers>
      </body>
    </html>
  );
}
