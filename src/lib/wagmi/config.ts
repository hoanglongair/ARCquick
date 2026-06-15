import { http, createConfig, fallback } from "wagmi";
import { mainnet, sepolia, polygon, arbitrum } from "wagmi/chains";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";
import { arcSepolia, arcTestnet, ARC_TESTNET_CONFIG } from "./chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

const arcTestnetTransports = fallback(
  [
    http(ARC_TESTNET_CONFIG.rpcUrls.primary, {
      batch: { batchSize: 100, wait: 16 },
      retryCount: 3,
      retryDelay: 200,
    }),
    http(ARC_TESTNET_CONFIG.rpcUrls.drpc, {
      batch: { batchSize: 100, wait: 16 },
      retryCount: 3,
      retryDelay: 200,
    }),
    http(ARC_TESTNET_CONFIG.rpcUrls.quicknode, {
      batch: { batchSize: 100, wait: 16 },
      retryCount: 3,
      retryDelay: 200,
    }),
    http(ARC_TESTNET_CONFIG.rpcUrls.blockdaemon, {
      batch: { batchSize: 100, wait: 16 },
      retryCount: 3,
      retryDelay: 200,
    }),
  ],
  { rank: false }
);

export const config = createConfig({
  chains: [arcSepolia, arcTestnet, sepolia, mainnet, polygon, arbitrum],
  connectors: [
    injected(),
    walletConnect({ projectId }),
    coinbaseWallet({ appName: "ARCquick" }),
  ],
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

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
