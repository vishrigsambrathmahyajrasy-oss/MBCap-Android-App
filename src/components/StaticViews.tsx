import React, { useState } from 'react';
import { CustomerWallet, SUPPORTED_CHAINS } from '../types/trading';
import { Copy, Check, ShieldAlert, DollarSign, Image, QrCode, Settings, RefreshCw, ExternalLink } from 'lucide-react';

// 1. NFTs View
export const NFTsView: React.FC = () => {
  const nfts = [
    { name: 'Pixel Pandas', chain: 'Ethereum', floor: '0.42 ETH', ch: 3.1, vol: '1,240 ETH' },
    { name: 'Moon Cats', chain: 'Base', floor: '0.08 ETH', ch: -4.2, vol: '310 ETH' },
    { name: 'Solar Punks', chain: 'Solana', floor: '12.5 SOL', ch: 8.6, vol: '9,800 SOL' },
    { name: 'Chain Foxes', chain: 'Polygon', floor: '95 POL', ch: 1.2, vol: '44,000 POL' },
    { name: 'Neon Owls', chain: 'Arbitrum', floor: '0.19 ETH', ch: -1.8, vol: '520 ETH' },
    { name: 'Orbit Pets', chain: 'BNB Chain', floor: '0.9 BNB', ch: 5.4, vol: '1,900 BNB' }
  ];

  return (
    <div className="bg-[#0b0f19] border border-[#182236] rounded-2xl p-4 sm:p-6 shadow-xl font-mono">
      <div className="border-b border-[#182236] pb-3 mb-4">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <Image className="w-5 h-5 text-[#F5B31B]" />
          <span>Trending NFT Collections</span>
        </h3>
        <p className="text-xs text-[#718096] mt-0.5">Floor prices and 24h trading volume across top chains.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[#718096] border-b border-[#182236] text-[11px]">
              <th className="py-2.5 px-3">Collection</th>
              <th className="py-2.5 px-3">Chain</th>
              <th className="py-2.5 px-3 text-right">Floor Price</th>
              <th className="py-2.5 px-3 text-right">24h Change</th>
              <th className="py-2.5 px-3 text-right">Volume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141b29]">
            {nfts.map(nft => (
              <tr key={nft.name} className="hover:bg-[#121927]">
                <td className="py-3 px-3 font-bold text-white">{nft.name}</td>
                <td className="py-3 px-3 text-[#8896ab]">{nft.chain}</td>
                <td className="py-3 px-3 text-right font-bold text-white">{nft.floor}</td>
                <td className="py-3 px-3 text-right font-bold">
                  <span className={nft.ch >= 0 ? 'text-[#2EE6A6]' : 'text-[#FF4D6A]'}>
                    {nft.ch >= 0 ? '+' : ''}{nft.ch}%
                  </span>
                </td>
                <td className="py-3 px-3 text-right text-[#cbd5e1]">{nft.vol}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 2. Chain-wise Fees View
export const ChainFeesView: React.FC = () => {
  const fees = [
    { chain: 'Ethereum', platformFee: '0.06% buy / 0.06% sell', estGas: '~$2.20', totalOn100: '~$2.26' },
    { chain: 'Base', platformFee: '0.06% buy / 0.06% sell', estGas: '~$0.02', totalOn100: '~$0.08' },
    { chain: 'BNB Chain', platformFee: '0.06% buy / 0.06% sell', estGas: '~$0.12', totalOn100: '~$0.18' },
    { chain: 'Arbitrum', platformFee: '0.06% buy / 0.06% sell', estGas: '~$0.08', totalOn100: '~$0.14' },
    { chain: 'Polygon', platformFee: '0.06% buy / 0.06% sell', estGas: '~$0.02', totalOn100: '~$0.08' },
    { chain: 'Avalanche', platformFee: '0.06% buy / 0.06% sell', estGas: '~$0.06', totalOn100: '~$0.12' },
    { chain: 'Optimism', platformFee: '0.06% buy / 0.06% sell', estGas: '~$0.04', totalOn100: '~$0.10' },
    { chain: 'Solana', platformFee: '0.06% buy / 0.06% sell', estGas: '~$0.01', totalOn100: '~$0.07' }
  ];

  return (
    <div className="bg-[#0b0f19] border border-[#182236] rounded-2xl p-4 sm:p-6 shadow-xl font-mono">
      <div className="border-b border-[#182236] pb-3 mb-4">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-[#F5B31B]" />
          <span>Chain-Wise Platform & Gas Fees</span>
        </h3>
        <p className="text-xs text-[#718096] mt-0.5">
          Platform fee is transparently fixed at 0.06% on a buy and 0.06% on a sell across all chains.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[#718096] border-b border-[#182236] text-[11px]">
              <th className="py-2.5 px-3">Chain Network</th>
              <th className="py-2.5 px-3">Platform Fee</th>
              <th className="py-2.5 px-3 text-right">Est. Network Gas</th>
              <th className="py-2.5 px-3 text-right font-bold text-white">Total on $100 Order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141b29]">
            {fees.map(f => (
              <tr key={f.chain} className="hover:bg-[#121927]">
                <td className="py-3 px-3 font-bold text-white">{f.chain}</td>
                <td className="py-3 px-3 text-[#F5B31B]">{f.platformFee}</td>
                <td className="py-3 px-3 text-right text-[#cbd5e1]">{f.estGas}</td>
                <td className="py-3 px-3 text-right font-bold text-[#2EE6A6]">{f.totalOn100}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 3. My Wallet Address View
export const WalletAddressView: React.FC<{ wallet: CustomerWallet; onConnectWallet: () => void }> = ({
  wallet,
  onConnectWallet
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-[#0b0f19] border border-[#182236] rounded-2xl p-4 sm:p-6 shadow-xl font-mono max-w-xl mx-auto">
      <div className="border-b border-[#182236] pb-3 mb-4">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <QrCode className="w-5 h-5 text-[#F5B31B]" />
          <span>Customer Wallet Address</span>
        </h3>
        <p className="text-xs text-[#718096] mt-0.5">
          One standard EVM address operates across Ethereum, Base, BNB Chain, Arbitrum, Polygon, and Avalanche.
        </p>
      </div>

      {wallet.isConnected && wallet.address ? (
        <div className="space-y-4">
          <div className="bg-[#07090e] border border-[#1a2336] p-4 rounded-xl text-center">
            <div className="text-xs text-[#718096] mb-1">Your On-Chain Address:</div>
            <div className="font-extrabold text-white text-xs sm:text-sm break-all select-all">
              {wallet.address}
            </div>
            <div className="text-xs text-[#2EE6A6] mt-2 font-bold">
              Balance: {wallet.nativeBalance}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 bg-[#F5B31B] hover:bg-[#e0a214] text-[#07090e] font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Address'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-xs text-[#718096] mb-4">No Web3 wallet currently connected.</p>
          <button
            onClick={onConnectWallet}
            className="bg-[#F5B31B] hover:bg-[#e0a214] text-[#07090e] font-extrabold px-5 py-2.5 rounded-xl text-xs shadow"
          >
            Connect Wallet
          </button>
        </div>
      )}
    </div>
  );
};

// 4. Disclaimer View
export const DisclaimerView: React.FC = () => {
  return (
    <div className="bg-[#0b0f19] border border-[#182236] rounded-2xl p-4 sm:p-6 shadow-xl font-mono max-w-2xl mx-auto space-y-4 text-xs leading-relaxed text-[#cbd5e1]">
      <div className="border-b border-[#182236] pb-3">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#F5B31B]" />
          <span>MBCap Trading Disclaimer & Risk Notice</span>
        </h3>
      </div>

      <p>
        MBCap provides decentralized cryptocurrency market data, live candlestick charts via public APIs, and a non-custodial Web3 swap interface.
      </p>

      <p className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl text-red-200">
        <b>HIGH RISK WARNING:</b> Crypto assets are volatile and trading involves risk of loss. Tokens with low liquidity or newly deployed pools may be subject to severe price slippage or rug pulls. Never trade funds you cannot afford to lose.
      </p>

      <p>
        <b>PLATFORM FEE:</b> MBCap charges a transparent platform fee of 0.06% on buys and 0.06% on sells. Network gas fees are paid directly to miners/validators on the respective blockchain.
      </p>

      <p>
        <b>NON-CUSTODIAL EXECUTION:</b> When trading in Live Real Mode, MBCap never holds your private keys or funds. Transactions are signed directly in your connected Web3 wallet.
      </p>
    </div>
  );
};
