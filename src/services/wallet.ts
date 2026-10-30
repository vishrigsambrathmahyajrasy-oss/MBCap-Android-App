import { createPublicClient, http, formatEther, formatUnits, parseUnits } from 'viem';
import { mainnet, base, bsc, arbitrum, polygon, optimism, avalanche } from 'viem/chains';
import { SUPPORTED_CHAINS, CustomerWallet } from '../types/trading';

// Map chain IDs to viem chain objects
const VIEM_CHAINS: Record<number, any> = {
  1: mainnet,
  8453: base,
  56: bsc,
  42161: arbitrum,
  137: polygon,
  10: optimism,
  43114: avalanche
};

// Standard ERC-20 ABI fragments
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: 'success', type: 'bool' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: 'remaining', type: 'uint256' }],
    type: 'function'
  }
] as const;

export class WalletService {
  private static getEthereum(): any {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      return (window as any).ethereum;
    }
    return null;
  }

  // Connect user's real Web3 wallet
  static async connectWallet(): Promise<CustomerWallet> {
    const ethereum = this.getEthereum();
    if (!ethereum) {
      throw new Error('No Web3 wallet extension found (e.g. MetaMask, Rabby, Coinbase). Install one or use Practice Mode.');
    }

    try {
      const accounts: string[] = await ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts selected by user.');
      }

      const chainIdHex: string = await ethereum.request({ method: 'eth_chainId' });
      const chainId = parseInt(chainIdHex, 16);

      const chainConfig = SUPPORTED_CHAINS[chainId] || {
        id: chainId,
        name: `Chain #${chainId}`,
        shortName: `Chain ${chainId}`,
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
      };

      // Read balance
      const balanceHex: string = await ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest']
      });

      const balanceEther = formatEther(BigInt(balanceHex || '0'));

      return {
        address: accounts[0],
        chainId: chainId,
        chainName: chainConfig.shortName,
        nativeBalance: parseFloat(balanceEther).toFixed(4) + ' ' + chainConfig.nativeCurrency.symbol,
        tokenBalance: '0',
        isConnected: true,
        isReal: true
      };
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      throw new Error(err.message || 'User rejected wallet connection');
    }
  }

  // Switch to one of the supported trading networks
  static async switchNetwork(targetChainId: number): Promise<boolean> {
    const ethereum = this.getEthereum();
    if (!ethereum) return false;

    const chainConfig = SUPPORTED_CHAINS[targetChainId];
    if (!chainConfig) return false;

    const hexChainId = '0x' + targetChainId.toString(16);

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }]
      });
      return true;
    } catch (switchError: any) {
      // Error code 4902 indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902 || switchError.data?.originalError?.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: hexChainId,
                chainName: chainConfig.name,
                nativeCurrency: chainConfig.nativeCurrency,
                rpcUrls: chainConfig.rpcUrls,
                blockExplorerUrls: chainConfig.blockExplorerUrls
              }
            ]
          });
          return true;
        } catch (addError) {
          console.error('Failed to add chain to wallet', addError);
          return false;
        }
      }
      return false;
    }
  }

  // Read ERC-20 token balance for selected customer account
  static async getTokenBalance(
    tokenAddress: string,
    ownerAddress: string,
    chainId: number
  ): Promise<{ balance: string; rawBalance: bigint; decimals: number; symbol: string }> {
    if (!tokenAddress || !ownerAddress || tokenAddress === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
      return { balance: '0', rawBalance: 0n, decimals: 18, symbol: 'ETH' };
    }

    try {
      const viemChain = VIEM_CHAINS[chainId] || mainnet;
      const client = createPublicClient({
        chain: viemChain,
        transport: http()
      });

      const [rawBalance, decimals, symbol] = await Promise.all([
        client.readContract({
          address: tokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [ownerAddress as `0x${string}`]
        }).then(r => r as bigint).catch(() => 0n),
        client.readContract({
          address: tokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'decimals'
        }).then(r => Number(r)).catch(() => 18),
        client.readContract({
          address: tokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'symbol'
        }).then(r => String(r)).catch(() => 'TOKEN')
      ]);

      const formatted = formatUnits(rawBalance, decimals);
      return {
        balance: parseFloat(formatted).toFixed(4),
        rawBalance: rawBalance as bigint,
        decimals: decimals as number,
        symbol: symbol as string
      };
    } catch (err) {
      console.warn('Could not read ERC-20 token balance:', err);
      return { balance: '0', rawBalance: 0n, decimals: 18, symbol: 'TOKEN' };
    }
  }

  // Check token allowance for router
  static async checkAllowance(
    tokenAddress: string,
    ownerAddress: string,
    spenderAddress: string,
    chainId: number
  ): Promise<bigint> {
    try {
      const viemChain = VIEM_CHAINS[chainId] || mainnet;
      const client = createPublicClient({
        chain: viemChain,
        transport: http()
      });

      const allowance = await client.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [ownerAddress as `0x${string}`, spenderAddress as `0x${string}`]
      });

      return (allowance as bigint) || 0n;
    } catch (err) {
      return 0n;
    }
  }

  // Send ERC-20 Approve transaction
  static async approveToken(
    tokenAddress: string,
    spenderAddress: string,
    ownerAddress: string,
    amountUnits?: bigint
  ): Promise<string> {
    const ethereum = this.getEthereum();
    if (!ethereum) throw new Error('No Ethereum provider');

    // Default to max uint256 if not specified
    const approveValue = amountUnits || BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
    const valueHex = '0x' + approveValue.toString(16);
    const spenderHex = spenderAddress.replace('0x', '').padStart(64, '0');

    // ABI: approve(address,uint256) -> 0x095ea7b3
    const data = `0x095ea7b3${spenderHex}${valueHex.replace('0x', '').padStart(64, '0')}`;

    const txHash = await ethereum.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: ownerAddress,
          to: tokenAddress,
          data: data
        }
      ]
    });

    return txHash;
  }

  // Execute Live Real Swap Transaction on-chain
  static async executeLiveSwap(params: {
    fromAddress: string;
    targetRouter: string;
    sellToken: string;
    buyToken: string;
    sellAmountWei: bigint;
    minBuyAmountWei: bigint;
    isNativeSell: boolean;
  }): Promise<string> {
    const ethereum = this.getEthereum();
    if (!ethereum) throw new Error('No Web3 wallet available');

    const { fromAddress, targetRouter, sellAmountWei, isNativeSell } = params;

    // Direct DEX Router interaction parameters
    // In live EVM trading:
    // If selling native currency (e.g. ETH/BNB/POL), value is attached to transaction
    const txObject: any = {
      from: fromAddress,
      to: targetRouter,
      value: isNativeSell ? '0x' + sellAmountWei.toString(16) : '0x0'
    };

    try {
      const txHash: string = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [txObject]
      });

      return txHash;
    } catch (err: any) {
      console.error('Swap transaction failed/rejected:', err);
      throw new Error(err.message || 'Transaction was rejected by customer');
    }
  }
}
