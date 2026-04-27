import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Bitcoin, Landmark, Smartphone, Globe, CheckCircle2, Copy, ExternalLink, ChevronRight, ShieldCheck, Coins } from 'lucide-react';

interface PaymentGatewaysProps {
  amount: number;
  currency: string;
  onSuccess: () => void;
  onCancel: () => void;
  astroCoins: number;
}

type PaymentMethod = 'card' | 'crypto' | 'upi' | 'bank' | 'astrocoins';

export const PaymentGateways: React.FC<PaymentGatewaysProps> = ({ amount, currency, onSuccess, onCancel, astroCoins }) => {
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const astroValue = astroCoins / 1000;
  const canAffordWithAstro = astroValue >= amount;

  const handlePay = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsDone(true);
    setTimeout(() => {
      onSuccess();
    }, 1500);
  };

  const methods = [
    { id: 'card', name: 'Global Card / USD', icon: Globe, desc: 'International Debit/Credit Cards', promo: 'Best for global transactions' },
    { id: 'crypto', name: 'Crypto Currency', icon: Bitcoin, desc: 'BTC, ETH, USDT (Global)', promo: 'Zero border fees' },
    { id: 'upi', name: 'UPI / India', icon: Smartphone, desc: 'PhonePe, Google Pay, Paytm', promo: 'Instant and fastest in India' },
    { id: 'bank', name: 'Bank Transfer', icon: Landmark, desc: 'Direct Wire (SWIFT/SEPA)', promo: 'Secure for large transfers' },
    { id: 'astrocoins', name: 'AstroCoins', icon: Coins, desc: `Pay with rewards (Available: ${astroCoins})`, promo: 'No-cost internal redemption' },
  ];

  return (
    <div className="bg-white rounded-[32px] overflow-hidden shadow-2xl border border-slate-100 max-w-md w-full">
      <div className="p-8 bg-slate-900 text-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black uppercase tracking-widest">Gateway</h3>
          <button onClick={onCancel} className="text-white/40 hover:text-white transition-colors">Close</button>
        </div>
        <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-xl border border-white/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Amount Due</p>
          <div className="text-4xl font-black flex items-baseline gap-2">
            <span className="text-lg opacity-60 font-medium">{currency}</span>
            {amount}.00
          </div>
        </div>
      </div>

      <div className="p-8">
        <AnimatePresence mode="wait">
          {!method ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-3"
            >
              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id as PaymentMethod)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group text-left relative"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-all">
                    <m.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{m.name}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{m.desc}</p>
                    <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">⚡ {m.promo}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400" />
                </button>
              ))}
            </motion.div>
          ) : isDone ? (
            <motion.div 
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center"
            >
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-black text-slate-900 mb-2">Payment Received</h4>
              <p className="text-slate-500 text-sm">Your cosmic transmission is ready.</p>
            </motion.div>
          ) : (
            <motion.div 
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setMethod(null)} className="text-[10px] font-black uppercase text-indigo-600 hover:underline">Back</button>
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              {method === 'card' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <CreditCard className="w-8 h-8 text-slate-400 mb-4" />
                    <p className="text-sm font-medium text-slate-600">Secure Stripe Checkout for USD</p>
                  </div>
                  <button onClick={handlePay} disabled={isProcessing} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 disabled:opacity-50">
                    {isProcessing ? 'Processing...' : 'Pay with Card'}
                  </button>
                </div>
              )}

              {method === 'crypto' && (
                <div className="space-y-4">
                  <div className="p-6 rounded-2xl bg-indigo-900 text-white">
                    <p className="text-[10px] font-black opacity-60 uppercase mb-3 text-center">BTC (SegWit) Address</p>
                    <div className="bg-black/20 p-4 rounded-xl flex items-center gap-2 font-mono text-[10px] break-all border border-white/10">
                      bc1qxy2kgdypjrsqz744m92z7pstqv06m3...
                      <Copy className="w-4 h-4 text-indigo-400 shrink-0 cursor-pointer" />
                    </div>
                  </div>
                  <button onClick={handlePay} disabled={isProcessing} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs disabled:opacity-50">
                    {isProcessing ? 'Verifying...' : 'Submit Transaction Hash'}
                  </button>
                </div>
              )}

              {method === 'upi' && (
                <div className="space-y-4">
                  <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl">
                    <div className="w-32 h-32 bg-slate-100 mx-auto mb-4 flex items-center justify-center rounded-xl">
                      {/* Simulated QR */}
                      <div className="grid grid-cols-4 gap-1 p-2">
                        {Array.from({length: 16}).map((_, i) => (
                           <div key={i} className={`w-4 h-4 ${Math.random() > 0.5 ? 'bg-slate-900' : 'bg-transparent'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm font-bold">VPA: cosmos.pay@ybl</p>
                  </div>
                  <button onClick={handlePay} disabled={isProcessing} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs disabled:opacity-50">
                    I have completed payment
                  </button>
                </div>
              )}

              {method === 'bank' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {[
                      { l: 'Bank', v: 'Cosmic National' },
                      { l: 'SWIFT', v: 'COSMUS33' },
                      { l: 'A/C Number', v: '0992331122' },
                    ].map(item => (
                      <div key={item.l} className="flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-black uppercase text-slate-400">{item.l}</span>
                        <span className="text-xs font-bold text-slate-800">{item.v}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={handlePay} disabled={isProcessing} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs disabled:opacity-50">
                    Upload Bank Receipt
                  </button>
                </div>
              )}

              {method === 'astrocoins' && (
                <div className="space-y-4">
                  <div className={`p-6 rounded-2xl ${canAffordWithAstro ? 'bg-indigo-600' : 'bg-red-50 border-red-200 border text-red-900'} text-white`}>
                    <div className="flex justify-between items-center mb-4">
                       <p className="text-[10px] font-black uppercase opacity-60">Balance</p>
                       <p className="text-[10px] font-black uppercase opacity-60">Value</p>
                    </div>
                    <div className="flex justify-between items-end">
                       <p className="text-3xl font-black tracking-tight">{astroCoins} AC</p>
                       <p className="text-xl font-bold opacity-80">${astroValue.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {!canAffordWithAstro && (
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-center px-4">
                       Insufficient tokens. Refer more seekers to earn tokens.
                    </p>
                  )}

                  <button 
                    onClick={handlePay} 
                    disabled={isProcessing || !canAffordWithAstro} 
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isProcessing ? 'Verifying Tokens...' : 'Redeem AstroCoins'}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-8 pb-8 flex items-center justify-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
        <ShieldCheck className="w-4 h-4 text-green-500" />
        256-bit Encrypted Session
      </div>
    </div>
  );
};
