import React from 'react';
import { motion } from 'motion/react';
import { Check, Star, Zap, Infinity, Sparkles } from 'lucide-react';
import { SubscriptionTier } from '../types';

interface Plan {
  id: SubscriptionTier;
  name: string;
  price: number;
  icon: any;
  color: string;
  features: string[];
  recommended?: boolean;
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic Seeker',
    price: 9,
    icon: Zap,
    color: 'indigo',
    features: [
      'Standard Lagna Chart',
      'Daily Horoscope',
      'Basic AI Analysis',
      '500 AstroCoins Monthly'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Sage',
    price: 29,
    icon: Star,
    color: 'pink',
    recommended: true,
    features: [
      'All Basic features',
      'Detailed Navamsha Analysis',
      'Nadi Thumb Interpretation',
      'Karmic Insight Reading',
      '2000 AstroCoins Monthly'
    ]
  },
  {
    id: 'cosmic',
    name: 'Cosmic Prophet',
    price: 99,
    icon: Infinity,
    color: 'emerald',
    features: [
      'All Premium features',
      'Unlimited AI Consultations',
      '1x One-on-One Expert Call',
      'Priority Support',
      'Custom Astral Calendar',
      '5000 AstroCoins Monthly'
    ]
  }
];

interface SubscriptionPlansProps {
  currentTier?: SubscriptionTier;
  onSelectPlan: (plan: Plan) => void;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ currentTier, onSelectPlan }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {plans.map((plan) => (
        <motion.div
          key={plan.id}
          whileHover={{ y: -10 }}
          className={`relative bg-white rounded-[40px] p-8 border-2 transition-all ${
            plan.recommended ? 'border-indigo-600 shadow-xl shadow-indigo-100' : 'border-slate-100 shadow-sm'
          }`}
        >
          {plan.recommended && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              Most Popular
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className={`w-12 h-12 rounded-2xl bg-${plan.color}-100 flex items-center justify-center text-${plan.color}-600`}>
              <plan.icon size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">${plan.price} / Month</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {plan.features.map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`mt-1 w-4 h-4 rounded-full bg-${plan.color}-50 flex items-center justify-center shrink-0`}>
                  <Check size={10} className={`text-${plan.color}-600`} />
                </div>
                <p className="text-sm font-medium text-slate-600">{feature}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => onSelectPlan(plan)}
            disabled={currentTier === plan.id}
            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
              currentTier === plan.id
                ? 'bg-slate-100 text-slate-400 cursor-default'
                : plan.recommended
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {currentTier === plan.id ? 'Current Plan' : 'Select Plan'}
          </button>
        </motion.div>
      ))}

      <div className="md:col-span-3 mt-4">
        <div className="bg-indigo-50 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4 text-left">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="font-black text-slate-900 text-sm">Corporate Spiritual Wellbeing</p>
                <p className="text-xs text-slate-500 font-medium">Bulk subscriptions for your team available upon request.</p>
              </div>
           </div>
           <button className="px-8 py-3 bg-white text-indigo-600 font-black rounded-xl text-[10px] uppercase tracking-widest border border-indigo-100 hover:bg-indigo-50 transition-all">
             Contact Sales
           </button>
        </div>
      </div>
    </div>
  );
};
