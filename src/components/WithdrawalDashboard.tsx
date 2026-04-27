import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Landmark, ArrowUpRight, Clock, CheckCircle2, RefreshCw, IndianRupee, ShieldCheck } from 'lucide-react';

interface WithdrawalDashboardProps {
  totalRevenue?: number; // in USD
}

export const WithdrawalDashboard: React.FC<WithdrawalDashboardProps> = ({ totalRevenue = 12450 }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasWithdrawn, setHasWithdrawn] = useState(false);
  const conversionRate = 83.5; // USD to INR conversion factor

  const bankDetails = {
    holder: "Bangaru Bharath Kumar",
    bank: "HDFC Bank",
    account: "50100347307985",
    ifsc: "HDFC0002095"
  };

  const handleWithdraw = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setHasWithdrawn(true);
    }, 3000);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
             <IndianRupee size={80} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Accrued (INR)</p>
          <h3 className="text-4xl font-black italic">₹{(totalRevenue * conversionRate).toLocaleString()}</h3>
          <p className="text-[10px] font-bold text-emerald-400 mt-4 flex items-center gap-2">
            <RefreshCw size={12} /> Live Conversion Rate: 1 USD = ₹{conversionRate}
          </p>
        </div>

        <div className="bg-white border-2 border-slate-100 rounded-[32px] p-8 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Platform Revenue</p>
          <h3 className="text-3xl font-black text-slate-900">${totalRevenue.toLocaleString()}</h3>
          <div className="mt-4 flex items-center gap-2 text-indigo-600 font-bold text-xs">
            <ArrowUpRight size={14} /> +12.5% this month
          </div>
        </div>

        <div className="bg-white border-2 border-slate-100 rounded-[32px] p-8 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Pending Clearances</p>
          <h3 className="text-3xl font-black text-slate-900">$450</h3>
          <p className="text-[10px] font-bold text-slate-400 mt-4">Expected payout: Oct 30</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[40px] border-2 border-slate-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                   <Landmark size={24} />
                </div>
                <div>
                   <h4 className="text-xl font-black text-slate-900">Settlement Account</h4>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">HDFC Primary Wallet</p>
                </div>
             </div>
             <div className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={12} /> Verified
             </div>
          </div>

          <div className="space-y-4 mb-8">
             <div className="flex justify-between items-center py-4 border-b border-slate-50">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Holder</span>
                <span className="text-sm font-bold text-slate-900">{bankDetails.holder}</span>
             </div>
             <div className="flex justify-between items-center py-4 border-b border-slate-50">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bank Name</span>
                <span className="text-sm font-bold text-slate-900">{bankDetails.bank}</span>
             </div>
             <div className="flex justify-between items-center py-4 border-b border-slate-50">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Number</span>
                <span className="text-sm font-mono font-bold text-slate-900">•••• •••• {bankDetails.account.slice(-4)}</span>
             </div>
             <div className="flex justify-between items-center py-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">IFSC Code</span>
                <span className="text-sm font-bold text-slate-900">{bankDetails.ifsc}</span>
             </div>
          </div>

          <button 
            onClick={handleWithdraw}
            disabled={isProcessing || hasWithdrawn}
            className={`w-full py-5 rounded-[32px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all ${
              hasWithdrawn ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200'
            }`}
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : hasWithdrawn ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : null}
            {isProcessing ? 'Processing Transfer...' : hasWithdrawn ? 'Transfer Initiated' : 'Initiate Settlement (INR)'}
          </button>
        </div>

        <div className="bg-slate-50 rounded-[40px] p-8">
           <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Recent Settlements</h4>
           <div className="space-y-4">
              {[
                { date: 'Oct 24, 2026', amount: '₹1,45,000', status: 'Completed' },
                { date: 'Oct 18, 2026', amount: '₹82,400', status: 'Completed' },
                { date: 'Oct 12, 2026', amount: '₹95,200', status: 'Completed' },
              ].map((tx, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl flex items-center justify-between shadow-sm border border-slate-100">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                         <Clock size={18} />
                      </div>
                      <div>
                         <p className="text-sm font-black text-slate-900">{tx.amount}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase">{tx.date}</p>
                      </div>
                   </div>
                   <span className="text-[10px] font-black uppercase text-emerald-500">{tx.status}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};
