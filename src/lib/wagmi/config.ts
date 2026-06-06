import { http, createConfig } from "wagmi";
import { mainnet, sepolia, polygon, arbitrum } from "wagmi/chains";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

// Arc Testnet chain configuration
export const arcTestnet = {
  id: 421614,
  name: "Arc Sepolia",
  network: "arc-sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://sepolio.arcaneprotocol.com/rpc"],
    },
    public: {
      http: ["https://sepolio.arcaneprotocol.com/rpc"],
    },
  },
  blockExplorers: {
    default: {
      name: "ArcScan",
      url: "https://sepolio.arcscan.io",
    },
  },
  testnet: true,
} as const;

export const config = createConfig({
  chains: [arcTestnet, sepolia, mainnet, polygon, arbitrum],
  connectors: [
    injected(),
    walletConnect({ projectId }),
    coinbaseWallet({ appName: "ARCquick" }),
  ],
  transports: {
    [arcTestnet.id]: http(),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
