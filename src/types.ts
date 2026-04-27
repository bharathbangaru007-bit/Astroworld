export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'cosmic';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  location: {
    lat: number;
    lng: number;
    timezone: string;
  };
  preferences: {
    chartStyle: 'north' | 'south';
    ayanamsa: 'lahiri' | 'raman';
    language?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  astroCoins?: number;
  tier?: SubscriptionTier;
  subscriptionExpiresAt?: Date;
}

export interface Planet {
  name: string;
  position: number; // degree 0-360
  sign: string;
  house: number;
  isRetrograde: boolean;
  nakshatra: string;
  pad: number;
}

export interface ChartData {
  planets: Planet[];
  ascendant: number;
  ayanamsha: number;
}

export interface DashaPeriod {
  planet: string;
  start: Date;
  end: Date;
  level: 'mahadasha' | 'antardasha' | 'pratyantardasha';
  interpretation?: string;
  subPeriods?: DashaPeriod[];
}

export interface AstrologicalReading {
  id?: string;
  userId: string;
  type: 'daily' | 'life_timeline' | 'remedy_analysis';
  chartData: ChartData;
  interpretation: string;
  remedies?: {
    gemstone: string;
    mantra: string;
    charity: string;
  };
  createdAt: Date;
}
