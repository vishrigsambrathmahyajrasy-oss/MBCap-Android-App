export interface ChainConfig {
  id: number;
  name: string;
  shortName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  routerAddress: string;
  color: string;
  icon: string;
}

export const SUPPORTED_CHAINS: Record<number, ChainConfig> = {
  1: {
    id: 1,
    name: 'Ethereum Mainnet',
    shortName: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://cloudflare-eth.com', 'https://eth.llamarpc.com'],
    blockExplorerUrls: ['https://etherscan.io'],
    routerAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    color: '#627EEA',
    icon: 'ETH'
  },
  8453: {
    id: 8453,
    name: 'Base Mainnet',
    shortName: 'Base',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.base.org', 'https://base.llamarpc.com'],
    blockExplorerUrls: ['https://basescan.org'],
    routerAddress: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24',
    color: '#0052FF',
    icon: 'BASE'
  },
  56: {
    id: 56,
    name: 'BNB Smart Chain',
    shortName: 'BNB Chain',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: ['https://bsc-dataseed.binance.org', 'https://binance.llamarpc.com'],
    blockExplorerUrls: ['https://bscscan.com'],
    routerAddress: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    color: '#F3BA2F',
    icon: 'BNB'
  },
  42161: {
    id: 42161,
    name: 'Arbitrum One',
    shortName: 'Arbitrum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://arb1.arbitrum.io/rpc', 'https://arbitrum.llamarpc.com'],
    blockExplorerUrls: ['https://arbiscan.io'],
    routerAddress: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24',
    color: '#28A0F0',
    icon: 'ARB'
  },
  137: {
    id: 137,
    name: 'Polygon PoS',
    shortName: 'Polygon',
    nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com', 'https://polygon.llamarpc.com'],
    blockExplorerUrls: ['https://polygonscan.com'],
    routerAddress: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
    color: '#8247E5',
    icon: 'POL'
  },
  10: {
    id: 10,
    name: 'Optimism Mainnet',
    shortName: 'Optimism',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.optimism.io', 'https://optimism.llamarpc.com'],
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
    routerAddress: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
    color: '#FF0420',
    icon: 'OP'
  },
  43114: {
    id: 43114,
    name: 'Avalanche C-Chain',
    shortName: 'Avalanche',
    nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://snowtrace.io'],
    routerAddress: '0x60aE616a2155BA3d9A68bFE59365C4a777564579',
    color: '#E84142',
    icon: 'AVAX'
  }
};

export interface TokenPool {
  id: string;
  name: string;
  symbol: string;
  baseSymbol?: string;
  quoteSymbol?: string;
  chain: string;
  chainId?: number;
  price: number;
  ch: number; // 24h percentage change
  vol: number; // 24h volume USD
  liq: number; // reserve liquidity USD
  fdv?: number;
  address: string; // pool pair address
  tokenAddress: string; // base token contract address
  url: string;
  source: string;
  pu?: number; // updated timestamp
  tx?: {
    b: number; // buys
    s: number; // sells
    by: number; // unique buyers
    sl: number; // unique sellers
  };
}

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface CustomerTradeReceipt {
  id: string;
  timestamp: number;
  txHash?: string;
  mode: 'live' | 'practice';
  side: 'buy' | 'sell';
  pair: string;
  chain: string;
  amountUsd: number;
  tokenAmount: number;
  price: number;
  feeUsd: number;
  status: 'confirmed' | 'pending' | 'failed';
  explorerUrl?: string;
}

export interface CustomerWallet {
  address: string | null;
  chainId: number | null;
  chainName: string;
  nativeBalance: string;
  tokenBalance: string;
  isConnected: boolean;
  isReal: boolean;
}

export interface SwapEstimation {
  usdAmount: number;
  tokenAmount: number;
  feeAmount: number;
  priceImpact: number;
  minReceived: number;
  route: string;
  gasCostUsd: number;
  needsApproval: boolean;
}
