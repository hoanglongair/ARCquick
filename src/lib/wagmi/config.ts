import { http, createConfig, fallback, type CreateConnectorFn } from "wagmi";
import { mainnet, sepolia, polygon, arbitrum } from "wagmi/chains";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";
import { arcSepolia, arcTestnet, ARC_TESTNET_CONFIG } from "./chains";

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() || "";

const hasValidProjectId = projectId.length > 0;

if (!hasValidProjectId && typeof window !== "undefined") {
  console.warn(
    "[wagmi] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not configured. " +
      "WalletConnect features (QR-code wallet pairing) are disabled. " +
      "Get a free Project ID at https://cloud.reown.com to enable them."
  );
}

const connectors: CreateConnectorFn[] = [injected()];

if (hasValidProjectId) {
  connectors.push(
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: "ARCquick",
        description: "Stablecoin-native wallet on Arc Network",
        url: typeof window !== "undefined" ? window.location.origin : "https://arcquick.app",
        icons: ["/favicon.ico"],
      },
    })
  );
}

connectors.push(
  coinbaseWallet({ appName: "ARCquick" })
);

const arcTestnetTransports = fallback(
  [
    http(ARC_TESTNET_CONFIG.rpcUrls.primary, {
      batch: { batchSize: 10, wait: 100 },
      retryCount: 1,
      retryDelay: 1000,
      timeout: 10_000,
    }),
    http(ARC_TESTNET_CONFIG.rpcUrls.drpc, {
      batch: { batchSize: 10, wait: 100 },
      retryCount: 1,
      retryDelay: 1000,
      timeout: 10_000,
    }),
    http(ARC_TESTNET_CONFIG.rpcUrls.quicknode, {
      batch: { batchSize: 10, wait: 100 },
      retryCount: 1,
      retryDelay: 1000,
      timeout: 10_000,
    }),
    http(ARC_TESTNET_CONFIG.rpcUrls.blockdaemon, {
      batch: { batchSize: 10, wait: 100 },
      retryCount: 1,
      retryDelay: 1000,
      timeout: 10_000,
    }),
  ],
  { rank: false, retryCount: 1 }
);

export const config = createConfig({
  chains: [arcSepolia, arcTestnet, sepolia, mainnet, polygon, arbitrum],
  connectors,
  transports: {
    [arcSepolia.id]: http(),
    [arcTestnet.id]: arcTestnetTransports,
    [sepolia.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
  },
  ssr: true,
});

export { hasValidProjectId as hasWalletConnectProjectId };

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
