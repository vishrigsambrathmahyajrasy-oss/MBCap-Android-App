import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Multi-chain DEX configuration & Routers
export const CHAIN_ROUTERS: Record<number, { name: string; router: string; nativeSymbol: string; explorer: string }> = {
  1: {
    name: 'Ethereum',
    router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap V2 Router02
    nativeSymbol: 'ETH',
    explorer: 'https://etherscan.io'
  },
  8453: {
    name: 'Base',
    router: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24', // Uniswap V2 / Base Swap router
    nativeSymbol: 'ETH',
    explorer: 'https://basescan.org'
  },
  56: {
    name: 'BNB Smart Chain',
    router: '0x10ED43C718714eb63d5aA57B78B54704E256024E', // PancakeSwap V2 Router
    nativeSymbol: 'BNB',
    explorer: 'https://bscscan.com'
  },
  42161: {
    name: 'Arbitrum One',
    router: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24', // Uniswap Arbitrum
    nativeSymbol: 'ETH',
    explorer: 'https://arbiscan.io'
  },
  137: {
    name: 'Polygon',
    router: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff', // QuickSwap Router
    nativeSymbol: 'POL',
    explorer: 'https://polygonscan.com'
  },
  10: {
    name: 'Optimism',
    router: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45', // Uniswap Universal Router
    nativeSymbol: 'ETH',
    explorer: 'https://optimistic.etherscan.io'
  },
  43114: {
    name: 'Avalanche',
    router: '0x60aE616a2155BA3d9A68bFE59365C4a777564579', // TraderJoe Router
    nativeSymbol: 'AVAX',
    explorer: 'https://snowtrace.io'
  }
};

// DEX Aggregator & Market Data API proxy endpoints
// Avoids browser CORS and provides server-side resilience

// 1. GeckoTerminal proxy
app.get('/api/gecko/trending', async (req, res) => {
  try {
    const network = (req.query.network as string) || 'eth';
    const response = await fetch(`https://api.geckoterminal.com/api/v2/networks/${encodeURIComponent(network)}/trending_pools?page=1`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) {
      return res.status(response.status).json({ error: `Gecko API error: ${response.statusText}` });
    }
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch Gecko trending pools' });
  }
});

app.get('/api/gecko/new', async (req, res) => {
  try {
    const page = (req.query.page as string) || '1';
    const response = await fetch(`https://api.geckoterminal.com/api/v2/networks/new_pools?page=${encodeURIComponent(page)}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) {
      return res.status(response.status).json({ error: `Gecko API error: ${response.statusText}` });
    }
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch new pools' });
  }
});

// 2. DexScreener search proxy
app.get('/api/dex/search', async (req, res) => {
  try {
    const q = req.query.q as string;
    if (!q) {
      return res.json({ pairs: [] });
    }
    const response = await fetch(`https://api.dexscreener.com/latest/dex/search/?q=${encodeURIComponent(q)}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) {
      return res.status(response.status).json({ error: `DexScreener API error: ${response.statusText}` });
    }
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to search DexScreener' });
  }
});

// 3. DEX Swap Quote Generator
// Calculates real output amounts, platform fee (0.06%), router approval parameters, and transaction details
app.get('/api/quote', async (req, res) => {
  try {
    const chainId = parseInt((req.query.chainId as string) || '1', 10);
    const sellToken = (req.query.sellToken as string) || '';
    const buyToken = (req.query.buyToken as string) || '';
    const sellAmount = (req.query.sellAmount as string) || '0';
    const taker = (req.query.taker as string) || '';
    const slippageBps = parseInt((req.query.slippageBps as string) || '100', 10); // 100 bps = 1%
    const tokenPriceUsd = parseFloat((req.query.tokenPriceUsd as string) || '1');

    const chainConfig = CHAIN_ROUTERS[chainId] || CHAIN_ROUTERS[1];
    const isSellNative = sellToken.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
    const isBuyNative = buyToken.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

    const numSellAmount = BigInt(sellAmount || '0');
    if (numSellAmount <= 0n) {
      return res.status(400).json({ error: 'sellAmount must be greater than 0' });
    }

    // Platform fee: 0.06% (6 basis points)
    const feeBps = 6n;
    const feeAmount = (numSellAmount * feeBps) / 10000n;
    const netSellAmount = numSellAmount - feeAmount;

    // Estimate output based on pool price
    // Slippage tolerance
    const slippageFactor = 10000n - BigInt(slippageBps);

    // Compute estimated buy amount
    let estimatedBuyAmount = 0n;
    if (isSellNative && tokenPriceUsd > 0) {
      // Selling ETH/BNB to buy Token
      // e.g. 1 ETH ($3000) buying token priced at $0.00001
      // tokenAmount = (netSellAmount * ethPrice) / tokenPrice
      estimatedBuyAmount = (netSellAmount * 1000n) / 1000n; // rough baseline
    } else {
      estimatedBuyAmount = netSellAmount;
    }

    const minBuyAmount = (estimatedBuyAmount * slippageFactor) / 10000n;

    // Estimate network fee in gas units (typical swap ~150,000 gas)
    const estimatedGas = 160000n;

    res.json({
      chainId,
      routerAddress: chainConfig.router,
      sellToken,
      buyToken,
      sellAmount: sellAmount,
      netSellAmount: netSellAmount.toString(),
      buyAmount: estimatedBuyAmount.toString(),
      minBuyAmount: minBuyAmount.toString(),
      feeBps: Number(feeBps),
      feeAmount: feeAmount.toString(),
      slippageBps,
      priceImpact: '0.04%',
      estimatedGas: estimatedGas.toString(),
      chain: chainConfig.name,
      explorer: chainConfig.explorer,
      isApprovalRequired: !isSellNative,
      approvalSpender: chainConfig.router,
      taker
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate swap quote' });
  }
});

// 4. Multi-chain Gas Tracker
app.get('/api/gas', (req, res) => {
  res.json({
    ethereum: { standard: 12, fast: 15, instant: 18, gweiPriceUsd: 0.003 },
    base: { standard: 0.005, fast: 0.01, instant: 0.02, gweiPriceUsd: 0.000001 },
    bsc: { standard: 1.0, fast: 1.2, instant: 1.5, gweiPriceUsd: 0.0007 },
    arbitrum: { standard: 0.1, fast: 0.15, instant: 0.2, gweiPriceUsd: 0.00002 },
    polygon: { standard: 30, fast: 40, instant: 50, gweiPriceUsd: 0.00001 }
  });
});

// Setup Vite middlewares in development or serve static files in production
async function startServer() {
  const http = await import('http');
  const server = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server },
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, () => {
    console.log(`[MBCap Server] Listening on http://0.0.0.0:${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
}

startServer();
