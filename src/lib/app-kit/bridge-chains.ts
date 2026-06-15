import { ARC_TESTNET_CONFIG } from "@/lib/wagmi/chains";

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
  finalityType?: "deterministic" | "probabilistic";
  cctpDomain?: number;
  requiredConfirmations?: number;
  blockTimeMs?: number;
  gasToken?: string;
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
    finalityType: "deterministic",
    requiredConfirmations: 1,
    gasToken: "ETH",
  },
  {
    id: 5042002,
    name: "Arc Testnet",
    icon: "\u039E",
    iconColor: "linear-gradient(135deg, #627eea, #a9b3ff)",
    nativeCurrency: { name: "USDC", symbol: "USDC" },
    rpcUrl: ARC_TESTNET_CONFIG.rpcUrls.primary,
    explorerUrl: ARC_TESTNET_CONFIG.blockExplorer,
    explorerName: "Arcscan",
    isTestnet: true,
    finalityType: "deterministic",
    cctpDomain: ARC_TESTNET_CONFIG.cctpDomain,
    requiredConfirmations: ARC_TESTNET_CONFIG.requiredConfirmations,
    blockTimeMs: ARC_TESTNET_CONFIG.blockTimeMs,
    gasToken: "USDC",
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
    finalityType: "probabilistic",
    requiredConfirmations: 64,
    gasToken: "ETH",
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
    finalityType: "probabilistic",
    requiredConfirmations: 64,
    gasToken: "ETH",
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
    finalityType: "probabilistic",
    requiredConfirmations: 20,
    gasToken: "MATIC",
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
    finalityType: "probabilistic",
    requiredConfirmations: 20,
    gasToken: "ETH",
  },
];

export function getChainById(id: number): BridgeChain | undefined {
  return SUPPORTED_BRIDGE_CHAINS.find((c) => c.id === id);
}

export function isArcTestnetChain(id: number): boolean {
  return id === ARC_TESTNET_CONFIG.chainId;
}
