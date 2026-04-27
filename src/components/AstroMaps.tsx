import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChartData, Planet } from '../types';
import { AstrologyChart } from './AstrologyChart';
import { Map, Info, Compass, Target, Shield, Zap } from 'lucide-react';

interface AstroMapsProps {
  d1: ChartData;
  d9: ChartData;
  d10: ChartData;
  d60: ChartData;
  style: 'north' | 'south';
}

type vargaType = 'D1' | 'D9' | 'D10' | 'D60';

export const AstroMaps: React.FC<AstroMapsProps> = ({ d1, d9, d10, d60, style }) => {
  const [activeVarga, setActiveVarga] = useState<vargaType>('D1');
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null);

  const charts: Record<vargaType, { data: ChartData; label: string; desc: string; icon: any }> = {
    D1: { data: d1, label: 'Lagna (D1)', desc: 'The Physical Body & Basic Destiny', icon: Compass },
    D9: { data: d9, label: 'Navamsha (D9)', desc: 'The Soul Purpose & Marriage/Fruits', icon: Map },
    D10: { data: d10, label: 'Dashamsha (D10)', desc: 'Career, Status & Public Life', icon: Target },
    D60: { data: d60, label: 'Shashtiamsha (D60)', desc: 'Extreme Precision & Deep Karma', icon: Shield },
  };

  const currentChart = charts[activeVarga];

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Chart Selector Sidebar */}
        <div className="w-full lg:w-72 flex flex-col gap-4">
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Select Astromap</h3>
            <div className="flex flex-col gap-3">
              {(Object.keys(charts) as vargaType[]).map((v) => {
                const Icon = charts[v].icon;
                return (
                  <button
                    key={v}
                    onClick={() => {
                        setActiveVarga(v);
                        setSelectedPlanet(null);
                        setSelectedHouse(null);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border-2 ${
                      activeVarga === v 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                        : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon size={20} />
                    <div className="text-left">
                      <p className="font-black text-sm">{charts[v].label}</p>
                      <p className={`text-[10px] font-bold ${activeVarga === v ? 'text-indigo-200' : 'text-slate-400'}`}>Division: {v}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-indigo-50 rounded-[32px] p-6 border-2 border-indigo-100">
             <div className="flex items-center gap-3 mb-4">
                <Info size={18} className="text-indigo-600" />
                <h4 className="font-black text-xs uppercase tracking-widest text-indigo-900">About {activeVarga}</h4>
             </div>
             <p className="text-xs font-medium text-slate-600 leading-relaxed">
               {currentChart.desc}
             </p>
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="flex-1 flex flex-col gap-8">
            <div className="relative">
                <AstrologyChart 
                    data={currentChart.data} 
                    style={style} 
                    title={currentChart.label}
                    onPlanetClick={setSelectedPlanet}
                    onHouseClick={setSelectedHouse}
                />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="wait">
                    {selectedPlanet ? (
                        <motion.div 
                            key="planet-info"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-indigo-900 rounded-[32px] p-8 text-white shadow-xl flex flex-col gap-4"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center font-black text-2xl">
                                        {selectedPlanet.name.substring(0, 1)}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black">{selectedPlanet.name}</h4>
                                        <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">{selectedPlanet.sign} • House {selectedPlanet.house}</p>
                                    </div>
                                </div>
                                {selectedPlanet.isRetrograde && (
                                    <div className="px-3 py-1 bg-red-500 rounded-full text-[10px] font-black uppercase tracking-widest">Retrograde</div>
                                )}
                            </div>
                            <div className="h-px bg-white/10" />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Nakshatra</p>
                                    <p className="font-bold text-sm">{selectedPlanet.nakshatra} (Pada {selectedPlanet.pad})</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Position</p>
                                    <p className="font-bold text-sm">{selectedPlanet.position.toFixed(2)}°</p>
                                </div>
                            </div>
                            <p className="text-xs text-indigo-200 mt-2 italic">
                                In {activeVarga}, {selectedPlanet.name} indicates depth in {activeVarga === 'D10' ? 'your career authority' : activeVarga === 'D9' ? 'your spiritual strength' : 'your basic personality'}.
                            </p>
                        </motion.div>
                    ) : selectedHouse ? (
                        <motion.div 
                            key="house-info"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 rounded-[32px] p-8 text-white shadow-xl flex flex-col gap-4"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center font-black text-xl">
                                    {selectedHouse}
                                </div>
                                <div>
                                    <h4 className="text-xl font-black">House {selectedHouse}</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Analysis in {activeVarga}</p>
                                </div>
                            </div>
                            <div className="h-px bg-white/10" />
                            <p className="text-sm font-medium text-slate-300">
                                This house contains {currentChart.data.planets.filter(p => p.house === selectedHouse).length} planets in this division. 
                                Focus on the {selectedHouse === 1 ? 'Ascendant' : selectedHouse === 10 ? 'X House (Midheaven)' : selectedHouse === 7 ? 'Descendant' : 'activities'} of this chart.
                            </p>
                        </motion.div>
                    ) : (
                        <div className="bg-white rounded-[32px] border border-slate-100 p-8 flex items-center justify-center text-center opacity-60">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Click a planet or house for details</p>
                        </div>
                    )}
                </AnimatePresence>

                <div className="bg-amber-50 rounded-[32px] p-8 border-2 border-amber-100 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <Zap size={20} className="text-amber-600" />
                        <h4 className="font-black text-sm uppercase tracking-widest text-amber-900">Live Insights</h4>
                    </div>
                    <ul className="space-y-4">
                        <li className="flex gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                            <p className="text-xs font-medium text-amber-800">Your {activeVarga} chart shows strong planetary alignment for this month.</p>
                        </li>
                        <li className="flex gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                            <p className="text-xs font-medium text-amber-800">Pay attention to nodes in {activeVarga === 'D9' ? 'relationships' : 'public spheres'}.</p>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
