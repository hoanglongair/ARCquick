"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config as wagmiConfig } from "@/lib/wagmi/config";
import { AppKitProvider } from "@/lib/app-kit/provider";
import { ToastProvider } from "@/components/effects";
import { WalletModalProvider } from "@/components/wallet";
import { AuthProvider } from "@/lib/supabase";
import { usePriceAlertChecker } from "@/hooks/use-price-alert-checker";
import { useLimitOrderChecker } from "@/hooks/use-limit-order-checker";
import { useTwapExecutor } from "@/hooks/use-twap-executor";
import { useGasPriceAlerts } from "@/hooks/use-gas-alerts";
import { useSecurityStore } from "@/stores/security-store";
import { useState } from "react";

function RealtimeListeners() {
  usePriceAlertChecker();
  useLimitOrderChecker();
  useTwapExecutor();

  const { settings } = useSecurityStore();
  useGasPriceAlerts(settings.gasAlertEnabled, settings.gasAlertThreshold);

  return null;
}

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
          <ToastProvider>
            <RealtimeListeners />
            <WalletModalProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </WalletModalProvider>
          </ToastProvider>
        </AppKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}