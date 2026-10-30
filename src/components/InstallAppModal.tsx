import React, { useState } from 'react';
import { X, Smartphone, Download, CheckCircle2, ShieldCheck, Terminal, Copy, Check, ExternalLink } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setInstallSuccess(true);
      }
    }
  };

  const bubblewrapCommand = `npx @bubblewrap/cli init --manifest="${window.location.origin}/manifest.webmanifest" && npx @bubblewrap/cli build`;

  const copyCommand = () => {
    navigator.clipboard.writeText(bubblewrapCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07090e]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150 font-mono text-[#e2e8f0]">
      <div className="relative w-full max-w-lg bg-[#0b0f19] border border-[#1e273a] rounded-3xl p-6 sm:p-7 shadow-2xl my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-[#718096] hover:text-white bg-[#07090e] hover:bg-[#162033] border border-[#1f283d] rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F5B31B] to-[#2EE6A6] p-[2px] shadow-lg">
            <div className="w-full h-full bg-[#07090e] rounded-[14px] flex items-center justify-center font-extrabold text-[#F5B31B]">
              <Smartphone className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              Install Android App / Build APK
            </h2>
            <div className="text-xs text-[#8896ab]">
              Package: <b className="text-white">com.mbcap.dex</b> · v1.2.0
            </div>
          </div>
        </div>

        {/* Install Options */}
        <div className="space-y-4 mb-6">
          {/* Method 1: Direct 1-Click Install (WebAPK on Android) */}
          <div className="bg-[#07090e] border border-[#1f283d] p-4 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#2EE6A6]/20 text-[#2EE6A6] text-xs flex items-center justify-center font-bold">1</span>
                <span>Direct 1-Click Install (Android WebAPK)</span>
              </span>
              <span className="text-[10px] bg-[#2a2208] text-[#F5B31B] px-2 py-0.5 rounded font-bold">
                Recommended
              </span>
            </div>

            <p className="text-xs text-[#cbd5e1] leading-relaxed">
              Google Chrome and Android generate a signed native <b>.apk (WebAPK)</b> on your device when you install. It runs in standalone fullscreen with its own app icon and app drawer presence.
            </p>

            {isInstalled ? (
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>MBCap is already installed on your device!</span>
              </div>
            ) : isInstallable ? (
              <button
                onClick={handleInstallClick}
                className="w-full bg-gradient-to-r from-[#2EE6A6] to-[#1cb883] hover:from-[#35f0b0] hover:to-[#22cf95] text-[#07090e] font-extrabold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#2EE6A6]/20 transition-all transform active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>Install MBCap App Now</span>
              </button>
            ) : (
              <div className="bg-[#121927] p-3 rounded-xl border border-[#1b253b] text-xs text-[#8896ab] space-y-1.5">
                <div className="font-bold text-white">To install on your Android phone:</div>
                <div className="text-[11px] leading-relaxed">
                  1. Open this link in <b>Google Chrome</b> on Android.<br />
                  2. Tap the <b>three dots (⋮)</b> in the top right.<br />
                  3. Tap <b>"Install App"</b> or <b>"Add to Home Screen"</b>.<br />
                  4. Android automatically compiles and installs the official <b>MBCap APK</b>!
                </div>
              </div>
            )}
          </div>

          {/* Method 2: CLI / Standalone APK Build Instructions */}
          <div className="bg-[#07090e] border border-[#1f283d] p-4 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#1e2a42] text-[#F5B31B] text-xs flex items-center justify-center font-bold">2</span>
                <span>Build Standalone APK via Bubblewrap CLI</span>
              </span>
              <span className="text-[10px] text-[#718096]">Google TWA</span>
            </div>

            <p className="text-xs text-[#cbd5e1] leading-relaxed">
              To compile an unsigned or signed standalone <b>.apk file</b> for sideloading or Google Play Store deployment, run Google's official Bubblewrap tool:
            </p>

            <div className="relative bg-[#05070a] border border-[#182030] p-3 rounded-xl text-xs font-mono text-[#F5B31B] break-all flex items-center justify-between gap-2">
              <span className="text-[11px]">{bubblewrapCommand}</span>
              <button
                onClick={copyCommand}
                className="p-1.5 bg-[#162033] hover:bg-[#1e2b45] text-white rounded-lg shrink-0 transition-colors"
                title="Copy Command"
              >
                {copiedCmd ? <Check className="w-3.5 h-3.5 text-[#2EE6A6]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[11px] text-[#718096] border-t border-[#182030] pt-3">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2EE6A6]" />
            <span>PWA & Android WebAPK Certified</span>
          </span>
          <button
            onClick={onClose}
            className="text-white hover:underline font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
