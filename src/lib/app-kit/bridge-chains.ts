export interface BridgeChain {
  id: number;
  name: string;
  icon: string;
  iconColor: string;
  nativeCurrency: {
    name: string;
    symbol: string;
  };
  rpcUrl: string;
  explorerUrl: string;
  explorerName: string;
  isTestnet: boolean;
}

export const SUPPORTED_BRIDGE_CHAINS: BridgeChain[] = [
  {
    id: 421614,
    name: "Arc Sepolia",
    icon: "\u039E",
    iconColor: "linear-gradient(135deg, #627eea, #a9b3ff)",
    nativeCurrency: { name: "Ethereum", symbol: "ETH" },
    rpcUrl: "https://sepolio.arcaneprotocol.com/rpc",
    explorerUrl: "https://sepolio.arcscan.io",
    explorerName: "ArcScan",
    isTestnet: true,
  },
  {
    id: 11155111,
    name: "Sepolia",
    icon: "\u039E",
    iconColor: "linear-gradient(135deg, #627eea, #a9b3ff)",
    nativeCurrency: { name: "Ethereum", symbol: "ETH" },
    rpcUrl: "https://rpc.sepolia.org",
    explorerUrl: "https://sepolia.etherscan.io",
    explorerName: "Etherscan",
    isTestnet: true,
  },
  {
    id: 1,
    name: "Ethereum",
    icon: "\u039E",
    iconColor: "linear-gradient(135deg, #627eea, #a9b3ff)",
    nativeCurrency: { name: "Ethereum", symbol: "ETH" },
    rpcUrl: "https://eth.llamarpc.com",
    explorerUrl: "https://etherscan.io",
    explorerName: "Etherscan",
    isTestnet: false,
  },
  {
    id: 137,
    name: "Polygon",
    icon: "\u22C6",
    iconColor: "linear-gradient(135deg, #8247e5, #a879ff)",
    nativeCurrency: { name: "MATIC", symbol: "MATIC" },
    rpcUrl: "https://polygon-rpc.com",
    explorerUrl: "https://polygonscan.com",
    explorerName: "Polygonscan",
    isTestnet: false,
  },
  {
    id: 42161,
    name: "Arbitrum",
    icon: "A",
    iconColor: "linear-gradient(135deg, #28a0f0, #12c5e9)",
    nativeCurrency: { name: "Ethereum", symbol: "ETH" },
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    explorerUrl: "https://arbiscan.io",
    explorerName: "Arbiscan",
    isTestnet: false,
  },
];

export function getChainById(id: number): BridgeChain | undefined {
  return SUPPORTED_BRIDGE_CHAINS.find((c) => c.id === id);
}
