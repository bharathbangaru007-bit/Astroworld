import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Gift, Copy, CheckCircle2, Share2, Coins, TrendingUp, Info } from 'lucide-react';

interface ReferAndEarnProps {
  userId: string;
  astroCoins: number;
}

export const ReferAndEarn: React.FC<ReferAndEarnProps> = ({ userId, astroCoins }) => {
  const [copied, setCopied] = useState(false);
  const referralLink = `${window.location.origin}?ref=${userId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Astroworld',
          text: 'Unlock your cosmic path with Astroworld. Use my referral link to get started!',
          url: referralLink,
        });
      } catch (err) {
        // Ignore AbortError which happens when user cancels sharing
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      // Fallback: Copy to clipboard if Web Share is not supported
      copyToClipboard();
      alert('Referral link copied to clipboard!');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-slate-900">
                <Gift className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Celestial Rewards</span>
            </div>
            <h2 className="text-5xl font-black tracking-tighter leading-none">Spread the <br/><span className="text-indigo-400">Light</span>, Earn Tokens</h2>
            <p className="text-slate-400 font-medium max-w-sm">
              Invite your soul tribe to Astroworld. For every friend who unlocks their cosmic path, you receive 1,000 AstroCoins.
            </p>
          </div>
          
          <div className="w-full md:w-auto">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] text-center min-w-[280px]">
              <div className="w-20 h-20 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-yellow-400/30">
                <Coins className="w-10 h-10 text-yellow-400 animate-bounce" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Your Balance</p>
              <div className="text-4xl font-black text-white flex items-center justify-center gap-2">
                {astroCoins.toLocaleString()}
                <span className="text-xs text-indigo-400 font-bold">AC</span>
              </div>
              <div className="mt-4 h-px bg-white/10 w-full" />
              <p className="mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">≈ ${(astroCoins/1000).toFixed(2)} USD</p>
            </div>
          </div>
        </div>
        
        {/* Abstract background shapes */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-2xl font-black text-slate-900 mb-6">Referral Link</h3>
          <p className="text-slate-500 font-medium mb-8">Share this unique link with friends or colleagues. Each successful subscription grants you instant tokens.</p>
          
          <div className="mt-auto space-y-4">
            <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 flex items-center gap-3 group">
              <input 
                type="text" 
                readOnly 
                value={referralLink}
                className="bg-transparent border-none outline-none flex-1 font-mono text-xs text-slate-900 font-bold"
              />
              <button 
                onClick={copyToClipboard}
                className="p-3 bg-white shadow-sm border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                title="Copy Link"
              >
                {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-indigo-600" />}
              </button>
            </div>
            
            <button 
              onClick={handleShare}
              className="w-full py-5 bg-indigo-600 text-white rounded-[32px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
            >
              <Share2 className="w-4 h-4" /> Share Referral Link
            </button>
          </div>
        </div>

        <div className="bg-indigo-50 rounded-[40px] p-10 border border-indigo-100 flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">How it works</h3>
          </div>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0">1</div>
              <div>
                <p className="font-black text-slate-900 text-sm">Send Invite</p>
                <p className="text-xs font-medium text-slate-500 mt-1">Share your unique cosmic link via email, socials, or message.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0">2</div>
              <div>
                <p className="font-black text-slate-900 text-sm">Friend Subscribes</p>
                <p className="text-xs font-medium text-slate-500 mt-1">When they purchase any spiritual reading or premium subscription.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0">3</div>
              <div>
                <p className="font-black text-slate-900 text-sm">Receive 1,000 tokens</p>
                <p className="text-xs font-medium text-slate-500 mt-1">Get instant AstroCoins that can be used to extend your access or buy new readings.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-10 p-5 bg-white rounded-3xl flex items-start gap-4">
            <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-relaxed">
              *Rewards are credited only after the referred user's payment is verified. No limit on total referrals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
