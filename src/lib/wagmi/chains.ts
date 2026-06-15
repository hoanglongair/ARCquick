import { defineChain } from "viem";

export const ARC_TESTNET_CONFIG = {
  chainId: 5042002,
  chainIdHex: "0x4CF4B2",
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18, displayDecimals: 6 },
  rpcUrls: {
    primary: "https://rpc.testnet.arc.network",
    blockdaemon: "https://rpc.blockdaemon.testnet.arc.network",
    drpc: "https://rpc.drpc.testnet.arc.network",
    quicknode: "https://rpc.quicknode.testnet.arc.network",
  },
  wsUrls: {
    primary: "wss://rpc.testnet.arc.network",
    drpc: "wss://rpc.drpc.testnet.arc.network",
    quicknode: "wss://rpc.quicknode.testnet.arc.network",
  },
  blockExplorer: "https://testnet.arcscan.app",
  gasTracker: "https://testnet.arcscan.app/gas-tracker",
  faucet: "https://faucet.circle.com",
  cctpDomain: 26,
  evmTarget: "Osaka",
  finality: "deterministic",
  requiredConfirmations: 1,
  minBaseFeeGwei: 20,
  blockTimeMs: 500,
  contracts: {
    usdc: "0x3600000000000000000000000000000000000000",
    tokenMessengerV2: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
    messageTransmitterV2: "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275",
    systemEmitter: "0xfffffffffffffffffffffffffffffffffffffffe",
  },
} as const;

export const ARC_SEPOLIA_CONFIG = {
  chainId: 421614,
  name: "Arc Sepolia",
  nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
  rpcUrl: "https://sepolio.arcaneprotocol.com/rpc",
  blockExplorer: "https://sepolio.arcscan.io",
} as const;

export const arcSepolia = defineChain({
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

const arcTestnetHttp = [
  ARC_TESTNET_CONFIG.rpcUrls.primary,
  ARC_TESTNET_CONFIG.rpcUrls.drpc,
  ARC_TESTNET_CONFIG.rpcUrls.quicknode,
  ARC_TESTNET_CONFIG.rpcUrls.blockdaemon,
];

const arcTestnetWs = [
  ARC_TESTNET_CONFIG.wsUrls.primary,
  ARC_TESTNET_CONFIG.wsUrls.drpc,
  ARC_TESTNET_CONFIG.wsUrls.quicknode,
];

export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  network: "arc-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "USDC",
    symbol: "USDC",
  },
  rpcUrls: {
    default: {
      http: arcTestnetHttp,
      webSocket: arcTestnetWs,
    },
    public: {
      http: arcTestnetHttp,
      webSocket: arcTestnetWs,
    },
  },
  blockExplorers: {
    default: {
      name: "Arcscan",
      url: ARC_TESTNET_CONFIG.blockExplorer,
    },
  },
  testnet: true,
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
    },
    usdc: {
      address: ARC_TESTNET_CONFIG.contracts.usdc,
    },
  },
});

export const ARC_CHAIN_IDS = [arcSepolia.id, arcTestnet.id] as const;
export type ArcChainId = (typeof ARC_CHAIN_IDS)[number];

export function isArcChain(chainId: number | undefined): chainId is ArcChainId {
  return chainId !== undefined && ARC_CHAIN_IDS.includes(chainId as ArcChainId);
}

export function isArcTestnet(chainId: number | undefined): boolean {
  return chainId === arcTestnet.id;
}
