"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config as wagmiConfig } from "@/lib/wagmi/config";
import { AppKitProvider } from "@/lib/app-kit/provider";
import { ToastProvider } from "@/components/effects";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitProvider>
          <ToastProvider>{children}</ToastProvider>
        </AppKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
