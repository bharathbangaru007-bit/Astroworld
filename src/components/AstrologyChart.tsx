import React from 'react';
import { ChartData, Planet } from '../types';
import { motion } from 'motion/react';

interface ChartProps {
  data: ChartData;
  style: 'north' | 'south';
  title?: string;
  onPlanetClick?: (planet: Planet) => void;
  onHouseClick?: (house: number) => void;
}

const themes = {
  midnight: { bg: 'bg-white', stroke: 'text-indigo-900', accent: 'text-indigo-600', retro: 'text-red-500', house: 'hover:bg-slate-50' },
  solar: { bg: 'bg-amber-50', stroke: 'text-amber-900', accent: 'text-amber-600', retro: 'text-orange-600', house: 'hover:bg-amber-100' },
  nebula: { bg: 'bg-slate-900', stroke: 'text-indigo-200', accent: 'text-pink-400', retro: 'text-rose-500', house: 'hover:bg-white/5' }
};

export const AstrologyChart: React.FC<ChartProps> = ({ data, style, title, onPlanetClick, onHouseClick }) => {
  const [currentTheme, setCurrentTheme] = React.useState<keyof typeof themes>('midnight');
  const t = themes[currentTheme];

  const getHousePlanets = (house: number) => {
    return data.planets.filter(p => p.house === house);
  };

  const renderNorthChart = () => {
    return (
      <svg viewBox="0 0 400 400" className="w-full max-w-[400px] h-auto cursor-default">
        <rect x="0" y="0" width="400" height="400" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="0" y1="0" x2="400" y2="400" stroke="currentColor" strokeWidth="1" />
        <line x1="400" y1="0" x2="0" y2="400" stroke="currentColor" strokeWidth="1" />
        <line x1="200" y1="0" x2="400" y2="200" stroke="currentColor" strokeWidth="1" />
        <line x1="400" y1="200" x2="200" y2="400" stroke="currentColor" strokeWidth="1" />
        <line x1="200" y1="400" x2="0" y2="200" stroke="currentColor" strokeWidth="1" />
        <line x1="0" y1="200" x2="200" y2="0" stroke="currentColor" strokeWidth="1" />

        {Array.from({ length: 12 }).map((_, i) => {
          const house = i + 1;
          const planets = getHousePlanets(house);
          const coords = getNorthCoords(house);
          return (
            <g 
              key={house} 
              className={`text-[10px] ${onHouseClick ? 'cursor-pointer' : ''}`}
              onClick={() => onHouseClick?.(house)}
            >
              <text x={coords.x} y={coords.y - 15} textAnchor="middle" opacity="0.3" fill="currentColor">{house}</text>
              {planets.map((p, idx) => (
                <g 
                  key={p.name} 
                  className={onPlanetClick ? 'cursor-pointer hover:opacity-70' : ''}
                  onClick={(e) => {
                    if (onPlanetClick) {
                      e.stopPropagation();
                      onPlanetClick(p);
                    }
                  }}
                >
                  {p.isRetrograde && (
                    <circle cx={coords.x} cy={coords.y + (idx * 12) - 3} r="8" fill="currentColor" opacity="0.1" className="animate-pulse" />
                  )}
                  <text 
                    x={coords.x} 
                    y={coords.y + (idx * 12)} 
                    textAnchor="middle" 
                    fontWeight="bold" 
                    fill={p.isRetrograde ? '#EF4444' : 'currentColor'}
                  >
                    {p.name.substring(0, 2)}{p.isRetrograde ? ' (R)' : ''}
                  </text>
                </g>
              ))}
            </g>
          );
        })}
      </svg>
    );
  };

  const renderSouthChart = () => {
    return (
      <div className={`grid grid-cols-4 grid-rows-4 border-2 ${currentTheme === 'nebula' ? 'border-white/20' : 'border-indigo-900/20'} aspect-square w-full max-w-[400px] cursor-default`}>
        {Array.from({ length: 16 }).map((_, i) => {
          const isCenter = (i === 5 || i === 6 || i === 9 || i === 10);
          if (isCenter) return <div key={i} className="flex items-center justify-center text-[10px] opacity-30 font-black uppercase text-center p-2">{i === 5 && title}</div>;
          
          const houseMap = [12, 1, 2, 3, 11, null, null, 4, 10, null, null, 5, 9, 8, 7, 6];
          const house = houseMap[i];
          if (house === null) return <div key={i} className="border border-current/5" />;

          const planets = getHousePlanets(house);
          return (
            <div 
              key={i} 
              onClick={() => onHouseClick?.(house)}
              className={`border border-current/10 p-1 flex flex-col items-center justify-start relative overflow-hidden transition-colors ${onHouseClick ? t.house + ' cursor-pointer' : ''}`}
            >
              <span className="absolute top-0.5 right-1 text-[8px] opacity-30 font-black">{house}</span>
              <div className="flex flex-wrap gap-1 justify-center mt-2">
                {planets.map(p => (
                  <span 
                    key={p.name} 
                    onClick={(e) => {
                      if (onPlanetClick) {
                        e.stopPropagation();
                        onPlanetClick(p);
                      }
                    }}
                    className={`text-[10px] font-black tracking-tighter ${p.isRetrograde ? 'text-red-500' : ''} ${onPlanetClick ? 'cursor-pointer hover:scale-110' : ''}`}
                  >
                    {p.name.substring(0, 2)}{p.isRetrograde ? 'R' : ''}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${t.bg} p-8 rounded-[40px] shadow-2xl border border-slate-200 transition-colors duration-500`}
    >
      <div className="flex justify-between items-center mb-8">
        <h3 className={`text-lg font-black tracking-tight ${t.accent} uppercase`}>{title}</h3>
        <div className="flex gap-1">
          {Object.keys(themes).map(name => (
            <button 
              key={name}
              onClick={() => setCurrentTheme(name as keyof typeof themes)}
              className={`w-4 h-4 rounded-full border-2 ${currentTheme === name ? 'border-indigo-600' : 'border-transparent'}`}
              style={{ backgroundColor: (themes as any)[name].bg === 'bg-slate-900' ? '#0f172a' : (themes as any)[name].bg === 'bg-amber-50' ? '#fffbeb' : '#ffffff' }}
            />
          ))}
        </div>
      </div>

      <div className={`flex justify-center transition-colors duration-500 ${t.stroke}`}>
        {style === 'north' ? renderNorthChart() : renderSouthChart()}
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-2 text-[10px] font-black uppercase tracking-tighter">
        {data.planets.map(p => (
          <span 
            key={p.name} 
            className={`px-3 py-1.5 rounded-full transition-all ${p.isRetrograde ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-100 text-slate-400'}`}
          >
            {p.name}: {Math.floor(p.position)}° {p.isRetrograde ? 'Retrograde' : ''}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

const getNorthCoords = (h: number) => {
  const centers = [
    { x: 200, y: 100 }, // 1
    { x: 100, y: 50 },  // 2
    { x: 50, y: 100 },  // 3
    { x: 100, y: 200 }, // 4
    { x: 50, y: 300 },  // 5
    { x: 100, y: 350 }, // 6
    { x: 200, y: 300 }, // 7
    { x: 300, y: 350 }, // 8
    { x: 350, y: 300 }, // 9
    { x: 300, y: 200 }, // 10
    { x: 350, y: 100 }, // 11
    { x: 300, y: 50 }   // 12
  ];
  return centers[h - 1] || { x: 0, y: 0 };
};
