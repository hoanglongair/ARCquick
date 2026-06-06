import { defineChain } from "viem";

export const arcTestnet = defineChain({
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
});
