import React from 'react';
import { motion } from 'motion/react';
import { DashaPeriod } from '../types';
import { format } from 'date-fns';

interface DashaTimelineProps {
  periods: DashaPeriod[];
  onInterpret?: (planet: string) => Promise<void>;
  isLoading?: boolean;
}

export const DashaTimeline: React.FC<DashaTimelineProps> = ({ periods, onInterpret, isLoading }) => {
  const now = new Date(); // Using real-time for active period detection
  
  return (
    <div className="relative pl-8 border-l-4 border-indigo-100 space-y-10 my-10 mx-4">
      {periods.map((period, index) => {
        const isActive = now >= period.start && now <= period.end;
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Node */}
            <div className={`absolute -left-[44px] top-0 w-6 h-6 rounded-full border-4 border-white shadow-xl transition-all duration-1000 ${isActive ? 'bg-indigo-600 shadow-indigo-500/50 scale-125' : 'bg-slate-200 shadow-none'}`} />
            
            <div className={`rounded-[32px] p-8 border transition-all duration-700 ${isActive ? 'bg-white shadow-2xl border-indigo-500/30 scale-[1.02] relative' : 'bg-slate-100 border-slate-200 scale-100'}`}>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.1, 0.4, 0.1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-indigo-500 rounded-[32px] pointer-events-none"
                />
              )}
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <h4 className={`text-3xl font-black tracking-tight ${isActive ? 'text-indigo-600' : 'text-slate-900'}`}>
                      {period.planet}
                    </h4>
                    {isActive && (
                      <span className="bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full animate-pulse">
                        Current
                      </span>
                    )}
                    <span className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] ml-2">Phase</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-sm">
                    {format(period.start, 'yyyy')} — {format(period.end, 'yyyy')}
                  </span>
                </div>
                
                <p className="text-slate-500 font-medium leading-relaxed mb-6">
                    A definitive period of {period.planet.toLowerCase()} archetypes. Pivot towards {getDashaTheme(period.planet)}.
                </p>

                {period.interpretation ? (
                  <div className="bg-indigo-50/50 rounded-2xl p-6 mb-6 border border-indigo-100">
                    <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                       AI Life Event Analysis
                    </h5>
                    <div className="text-xs text-indigo-900 leading-relaxed space-y-2 opacity-80" dangerouslySetInnerHTML={{ __html: period.interpretation.replace(/\n/g, '<br/>').replace(/\*(.*?)\*/g, '<b>$1</b>') }} />
                  </div>
                ) : (
                  onInterpret && (
                    <button 
                      onClick={() => onInterpret(period.planet)}
                      disabled={isLoading}
                      className="text-[10px] font-black text-white bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-xl uppercase tracking-widest transition-all mb-6 disabled:opacity-50"
                    >
                      {isLoading ? 'Decrypting Destiny...' : 'Generate AI Insights'}
                    </button>
                  )
                )}

                {period.subPeriods && (
                  <div className="flex flex-wrap gap-2">
                    {period.subPeriods.slice(0, 8).map((sub, i) => (
                      <div key={i} className={`text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-sm border ${isActive ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-white text-slate-400 border-slate-100'}`}>
                        {sub.planet}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

const getDashaTheme = (planet: string) => {
  const themes: Record<string, string> = {
    'Sun': 'career elevation, power, and vitality',
    'Moon': 'emotional balance, intuition, and public life',
    'Mars': 'courage, technical skill, and property matters',
    'Merc': 'intellectual growth, business, and communication',
    'Jupi': 'wisdom, expansion, spiritual growth, and fortune',
    'Venu': 'comfort, relationships, creative pursuits, and art',
    'Satu': 'discipline, structural changes, and hard-earned success',
    'Rahu': 'innovation, ambition, and sudden twists of fate',
    'Ketu': 'letting go, detachment, and spiritual internalisation'
  };
  return themes[planet] || 'transformation';
};
