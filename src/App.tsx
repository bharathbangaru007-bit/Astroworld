/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';
import { UserProfile, Planet, ChartData, DashaPeriod, AstrologicalReading } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Calendar, Fingerprint, Sparkles, Moon, Sun, Star, MapPin, Clock, CreditCard, Save, CheckCircle, Landmark, Gift, Languages, Map } from 'lucide-react';
import { AstrologyChart } from './components/AstrologyChart';
import { AstroMaps } from './components/AstroMaps';
import { DashaTimeline } from './components/DashaTimeline';
import { ThumbAnalysis } from './components/ThumbAnalysis';
import { interpretChart, getKarmicRemedies } from './services/geminiService';
import { PaymentGateways } from './components/PaymentGateways';
import { WithdrawalDashboard } from './components/WithdrawalDashboard';
import { ReferAndEarn } from './components/ReferAndEarn';
import { SubscriptionPlans } from './components/SubscriptionPlans';
import { SubscriptionTier } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'charts' | 'timeline' | 'nadi' | 'insights' | 'support' | 'creator' | 'refer' | 'astromaps'>('dashboard');
  const [aiReading, setAiReading] = useState<{ 
    general: string; 
    karmic: string; 
    career: string;
    remedies?: { gemstone: string; mantra: string; charity: string };
  } | null>(null);
  const [isReadingLoading, setIsReadingLoading] = useState(false);
  const [isSavingReading, setIsSavingReading] = useState(false);
  const [readingSaved, setReadingSaved] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [pendingTier, setPendingTier] = useState<SubscriptionTier | null>(null);
  
  const languages = [
    'English', 'Hindi', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Russian', 'Arabic', 'Portuguese', 
    'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Italian', 'Korean', 
    'Vietnamese', 'Turkish', 'Dutch', 'Polish', 'Greek'
  ];
  
  const [dashaPeriods, setDashaPeriods] = useState<DashaPeriod[]>(mockDashaPeriods);
  const [isDashaLoading, setIsDashaLoading] = useState(false);

  const isCreator = user?.email === 'bharath.bangaru007@gmail.com';

  // Authentication & Profile Loading
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveProfile = async (birthDetails: Partial<UserProfile>) => {
    if (!user) return;
    const newProfile: UserProfile = {
      uid: user.uid,
      displayName: user.displayName || 'Seeker',
      email: user.email || '',
      birthDate: birthDetails.birthDate!,
      birthTime: birthDetails.birthTime!,
      birthPlace: birthDetails.birthPlace!,
      location: { lat: 0, lng: 0, timezone: 'UTC' },
      preferences: { chartStyle: 'north', ayanamsa: 'lahiri' }, 
      createdAt: new Date(),
      updatedAt: new Date(),
      astroCoins: 0,
      ...birthDetails,
    } as UserProfile;

    try {
      await setDoc(doc(db, 'users', user.uid), newProfile);
      setProfile(newProfile);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}`);
    }
  };

  const generateAIReading = async () => {
    if (!profile) return;
    setIsReadingLoading(true);
    try {
      const context = "Provide a comprehensive spiritual reading covering: 1. Life Purpose and Career (Dashamsha focus), 2. Relationship Dynamics (Navamsha focus), 3. Current Dasha Influence. Format clearly with headers.";
      const [readingResponse, remediesResponse] = await Promise.all([
        interpretChart(mockChartData, context, selectedLanguage),
        getKarmicRemedies(mockChartData, selectedLanguage)
      ]);
      
      setAiReading({
        general: readingResponse,
        karmic: readingResponse.includes("Karmic") ? readingResponse : "Your karmic path is currently influenced by the placement of Saturn in your 11th house, suggesting a period of restructuring your social circles and long-term goals.",
        career: "D10 analysis suggests a shift towards leadership roles in late 2026.",
        remedies: remediesResponse
      });
      setReadingSaved(false);
      setActiveTab('insights');
    } catch (error) {
      console.error(error);
    } finally {
      setIsReadingLoading(false);
    }
  };

  const saveReading = async () => {
    if (!user || !aiReading) return;
    setIsSavingReading(true);
    try {
      const readingsCol = collection(db, 'users', user.uid, 'readings');
      const readingData: Omit<AstrologicalReading, 'id'> = {
        userId: user.uid,
        type: 'daily',
        chartData: mockChartData,
        interpretation: JSON.stringify(aiReading),
        createdAt: new Date(),
      };
      await addDoc(readingsCol, readingData);
      setReadingSaved(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/readings`);
    } finally {
      setIsSavingReading(false);
    }
  };

  const handleInterpretDasha = async (planet: string) => {
    setIsDashaLoading(true);
    try {
      const dashaContext = `Provide a detailed interpretation for the ${planet} Mahadasha period. Focus on potential life events likely to occur, specific challenges and obstacles the individual might face, and growth/spiritual opportunities during this timeline.`;
      const response = await interpretChart(mockChartData, dashaContext, selectedLanguage);
      setDashaPeriods(prev => prev.map(p => p.planet === planet ? { ...p, interpretation: response } : p));
    } catch (error) {
      console.error(error);
    } finally {
      setIsDashaLoading(false);
    }
  };

  const handleSelectPlan = (plan: any) => {
    setPaymentAmount(plan.price);
    setPendingTier(plan.id);
    setShowPayment(true);
  };

  const handlePaymentSuccess = async () => {
    if (pendingTier && profile) {
      const newProfile = { 
        ...profile, 
        tier: pendingTier,
        subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      } as UserProfile;
      await setDoc(doc(db, 'users', profile.uid), newProfile);
      setProfile(newProfile);
      setPendingTier(null);
    } else {
      setReadingSaved(true);
    }
    setShowPayment(false);
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#6366F1] text-white font-extrabold text-2xl tracking-tight">Syncing Cosmos...</div>;

  if (!user) return <LoginView onLogin={handleLogin} />;

  if (!profile) return <OnboardingView onSave={handleSaveProfile} />;

  return (
    <div className="min-h-screen bg-[#6366F1] flex overflow-hidden">
      {/* Navigation Mini Sidebar */}
      <nav className="w-24 hidden md:flex flex-col items-center py-10 gap-8 bg-indigo-700/30">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-white/20">
          <div className="w-6 h-6 bg-indigo-600 rounded-full animate-pulse"></div>
        </div>
        <div className="flex flex-col gap-6">
          <NavButtonSidebar active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<Compass />} label="Home" />
          <NavButtonSidebar active={activeTab === 'charts'} onClick={() => setActiveTab('charts')} icon={<Star />} label="Charts" />
          <NavButtonSidebar active={activeTab === 'astromaps'} onClick={() => setActiveTab('astromaps')} icon={<Map />} label="Astromaps" />
          <NavButtonSidebar active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} icon={<Calendar />} label="Dasha" />
          <NavButtonSidebar active={activeTab === 'nadi'} onClick={() => setActiveTab('nadi')} icon={<Fingerprint />} label="Nadi" />
          <NavButtonSidebar active={activeTab === 'insights'} onClick={() => setActiveTab('insights')} icon={<Sparkles />} label="Karmic" />
          <NavButtonSidebar active={activeTab === 'refer'} onClick={() => setActiveTab('refer')} icon={<Gift />} label="Rewards" bg="bg-yellow-500" />
          <NavButtonSidebar active={activeTab === 'support'} onClick={() => setActiveTab('support')} icon={<CreditCard />} label="Support" bg="bg-pink-500" />
          {isCreator && (
            <NavButtonSidebar active={activeTab === 'creator'} onClick={() => setActiveTab('creator')} icon={<Landmark />} label="Payouts" bg="bg-emerald-600" />
          )}
        </div>
        <div className="mt-auto flex flex-col items-center gap-4">
          <div className="relative group">
            <button className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all">
              <Languages size={20} />
            </button>
            <div className="absolute bottom-12 left-0 w-48 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] max-h-64 overflow-y-auto p-2 scrollbar-hide">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 p-2 border-b border-white/5 mb-1">Select Language</p>
              {languages.map(lang => (
                <button 
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${selectedLanguage === lang ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-pink-400 p-1 relative">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">
              {profile.displayName.substring(0, 2).toUpperCase()}
            </div>
            {profile.tier && profile.tier !== 'free' && (
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#1E293B] flex items-center justify-center ${
                profile.tier === 'cosmic' ? 'bg-emerald-500' : profile.tier === 'premium' ? 'bg-pink-500' : 'bg-indigo-500'
              }`}>
                <Star size={10} className="text-white" />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Nav */}
      <nav className="fixed bottom-6 left-6 right-6 md:hidden glass-vibrant rounded-3xl p-4 flex justify-around z-50 overflow-x-auto gap-4 scrollbar-hide">
        <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<Compass />} label="Home" />
        <NavButton active={activeTab === 'charts'} onClick={() => setActiveTab('charts')} icon={<Star />} label="Charts" />
        <NavButton active={activeTab === 'astromaps'} onClick={() => setActiveTab('astromaps')} icon={<Map />} label="Maps" />
        <NavButton active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} icon={<Calendar />} label="Dasha" />
        <NavButton active={activeTab === 'nadi'} onClick={() => setActiveTab('nadi')} icon={<Fingerprint />} label="Nadi" />
        <NavButton active={activeTab === 'insights'} onClick={() => setActiveTab('insights')} icon={<Sparkles />} label="Karmic" />
        <NavButton active={activeTab === 'refer'} onClick={() => setActiveTab('refer')} icon={<Gift />} label="Gift" />
        <NavButton active={activeTab === 'support'} onClick={() => setActiveTab('support')} icon={<CreditCard />} label="Pay" />
        {isCreator && (
          <NavButton active={activeTab === 'creator'} onClick={() => setActiveTab('creator')} icon={<Landmark />} label="Withdraw" />
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 bg-slate-50 md:rounded-l-[48px] p-6 md:p-12 overflow-y-auto workspace-shadow flex flex-col gap-10">
        <header className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Blessings, <span className="text-indigo-600">{profile.displayName}!</span></h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-slate-500 font-medium">The celestial spheres are in perfect alignment.</p>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-full">
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
                  <span className="text-[10px] font-black text-yellow-700 uppercase tracking-wider">{profile.astroCoins || 0} ASTROCOINS</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('support')}
              className="hidden sm:block px-6 py-3 bg-pink-500 text-white rounded-2xl font-bold hover:bg-pink-600 shadow-lg shadow-pink-500/30 transition-all"
            >
              Premium Support
            </button>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              {/* Featured Section */}
              <section className="h-auto md:h-64 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-[32px] p-8 md:p-10 relative overflow-hidden flex items-center shadow-xl">
                <div className="z-10 w-full">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white uppercase tracking-wider">Major Influence</span>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-4 max-w-xl leading-tight">
                    {mockChartData.planets.find(p => p.name === 'Moon')?.nakshatra} Nakshatra governs your current emotional cycle.
                  </h2>
                  <div className="mt-8 flex flex-col md:flex-row items-center gap-6">
                    <button 
                      onClick={generateAIReading}
                      disabled={isReadingLoading}
                      className="px-8 py-3 bg-white text-indigo-600 rounded-2xl font-bold shadow-lg hover:bg-indigo-50 transition-all flex items-center gap-2"
                    >
                      {isReadingLoading ? <Clock className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                      {isReadingLoading ? 'Consulting Gemini Pro...' : 'Divine Guidance'}
                    </button>
                    <div className="flex items-center gap-4 text-white/80 font-bold">
                       <span className="text-sm">Planetary Sync</span>
                       <div className="h-2 w-32 bg-white/30 rounded-full">
                         <div className="h-full w-4/5 bg-white rounded-full"></div>
                       </div>
                    </div>
                  </div>
                </div>
                {/* Decorative shapes */}
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full"></div>
                <div className="absolute right-20 top-10 w-24 h-24 border-4 border-white/10 rounded-full"></div>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[32px] shadow-sm border-b-8 border-indigo-500 flex flex-col gap-6">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl">🌙</div>
                      <h3 className="font-extrabold text-slate-900 text-xl tracking-tight">Karmic Pulse</h3>
                   </div>
                   <p className="text-slate-500 font-medium leading-relaxed italic">
                      Recommended: Wear a high-vibration white sapphire or practice "Om Som Somaiya Namah" 108 times during this Moon transit.
                   </p>
                </div>

                <div className="bg-white p-8 rounded-[32px] shadow-sm border-b-8 border-yellow-400 flex flex-col gap-6">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center text-2xl">⏳</div>
                      <h3 className="font-extrabold text-slate-900 text-xl tracking-tight">Muhurta Watch</h3>
                   </div>
                   <div className="space-y-3">
                      <MuhurtaItem label="Abhijit" time="11:45 - 12:32" value="Success" color="text-indigo-600" />
                      <MuhurtaItem label="Rahu Kaal" time="15:20 - 16:55" value="Avoid" color="text-pink-600" />
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div key="insights" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="space-y-10">
               <div className="mb-10">
                   <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Karmic Insights</h2>
                   <p className="text-indigo-500 font-bold uppercase tracking-widest text-xs mt-2">Personalized Astrological Intelligence</p>
                </div>

              {!aiReading ? (
                <div className="bg-indigo-50 border-2 border-indigo-100 rounded-[48px] p-12 text-center space-y-6">
                  <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                    <Sparkles className="text-white w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">Awaiting Celestial Alignment</h3>
                    <p className="text-slate-500 font-medium mt-2">Generate your first reading from the dashboard to unlock these insights.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold"
                  >
                    Go to Dashboard
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <div className="bg-indigo-900 rounded-[48px] p-10 md:p-12 text-white relative overflow-hidden">
                      <div className="relative z-10 space-y-6">
                        <div className="flex justify-between items-start">
                          <h3 className="text-3xl font-extrabold tracking-tight">Divine Interpretation</h3>
                          <div className="flex gap-2">
                            {!readingSaved ? (
                               <button 
                                 onClick={() => {
                                   setPaymentAmount(29);
                                   setShowPayment(true);
                                 }}
                                 className="px-6 py-3 bg-white text-indigo-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-lg"
                               >
                                 <CreditCard className="w-4 h-4" />
                                 Unlock Full Access
                               </button>
                            ) : (
                              <button
                                onClick={saveReading}
                                disabled={isSavingReading}
                                className={`p-3 rounded-2xl transition-all flex items-center gap-2 font-bold text-sm ${
                                  readingSaved 
                                    ? 'bg-emerald-500 text-white' 
                                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                                }`}
                              >
                                {isSavingReading ? (
                                  <Clock className="animate-spin w-4 h-4" />
                                ) : (
                                  <Save className="w-4 h-4" />
                                )}
                                {readingSaved ? 'Archived' : 'Archive Reading'}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="text-indigo-100/90 whitespace-pre-wrap leading-relaxed text-lg font-medium" dangerouslySetInnerHTML={{ __html: aiReading.general.replace(/\*\*(.*?)\*\*/g, '<b class="text-white font-black">$1</b>') }} />
                      </div>
                      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-indigo-500/10 to-transparent" />
                    </div>

                     <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100 space-y-8">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center"><Sparkles size={20}/></div>
                          Divine Remedies
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="p-6 bg-pink-50 rounded-3xl border border-pink-100 flex flex-col gap-3">
                              <p className="text-[10px] font-black uppercase tracking-widest text-pink-600">Gemstone</p>
                              <p className="text-sm font-bold text-slate-800 leading-relaxed">{aiReading.remedies?.gemstone || 'Recommended: White Sapphire.'}</p>
                           </div>
                           <div className="p-6 bg-purple-50 rounded-3xl border border-purple-100 flex flex-col gap-3">
                              <p className="text-[10px] font-black uppercase tracking-widest text-purple-600">Mantra</p>
                              <p className="text-sm font-bold text-slate-800 leading-relaxed">{aiReading.remedies?.mantra || 'OM SOM SOMAYA NAMAH'}</p>
                           </div>
                           <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 flex flex-col gap-3">
                              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Charitable Act</p>
                              <p className="text-sm font-bold text-slate-800 leading-relaxed">{aiReading.remedies?.charity || 'Donate milk or silver on Mondays.'}</p>
                           </div>
                        </div>

                        <div className="h-px bg-slate-100" />

                        <div>
                          <h4 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-widest">Soul Purpose Insight</h4>
                          <p className="text-slate-600 font-medium text-lg leading-relaxed">{aiReading.karmic}</p>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-8">
                     <div className="bg-emerald-50 p-8 rounded-[40px] border-2 border-emerald-100 space-y-6">
                        <h4 className="font-black text-emerald-900 uppercase tracking-widest text-xs">Career Trajectory (D10)</h4>
                        <p className="text-emerald-800 font-bold leading-relaxed">{aiReading.career}</p>
                        <div className="flex gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                          <div className="w-2 h-2 rounded-full bg-emerald-200"></div>
                          <div className="w-2 h-2 rounded-full bg-emerald-100"></div>
                        </div>
                     </div>

                     <div className="bg-indigo-50 p-8 rounded-[40px] border-2 border-indigo-100 space-y-4">
                        <h4 className="font-black text-indigo-900 uppercase tracking-widest text-xs">Current Transit Flow</h4>
                        <div className="space-y-4">
                          <TransitItem planet="Jupiter" status="Favorable" />
                          <TransitItem planet="Saturn" status="Demanding" />
                          <TransitItem planet="Venus" status="Exalted" />
                        </div>
                     </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'support' && profile && (
            <motion.div key="support" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
               <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                 <div>
                    <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Cosmic Tiers</h2>
                    <p className="text-pink-500 font-bold uppercase tracking-widest text-xs mt-2">Unlock deeper celestial alignments</p>
                 </div>
                 
                 {profile.tier && profile.tier !== 'free' && (
                   <div className="bg-indigo-600 rounded-2xl px-6 py-3 text-white">
                      <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Current Tier</p>
                      <p className="font-black tracking-tight uppercase text-sm">{profile.tier}</p>
                   </div>
                 )}
               </div>

               <SubscriptionPlans 
                  currentTier={profile?.tier} 
                  onSelectPlan={handleSelectPlan} 
               />

               <div className="mt-16 bg-white rounded-[40px] border border-slate-100 p-10">
                  <h3 className="text-2xl font-black text-slate-900 mb-6">Payment Gateways</h3>
                  <p className="text-slate-500 font-medium mb-10 max-w-2xl">
                    Astroworld supports multiple global payment standards. All transactions are securely encrypted and processed via decentralized gateways.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 opacity-40 grayscale pointer-events-none">
                    <div className="h-20 bg-slate-50 rounded-2xl flex items-center justify-center p-6"><img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" /></div>
                    <div className="h-20 bg-slate-50 rounded-2xl flex items-center justify-center p-4 font-black text-slate-300 uppercase italic">Razorpay</div>
                    <div className="h-20 bg-slate-50 rounded-2xl flex items-center justify-center p-4 font-black text-slate-300 uppercase italic">Bitpay</div>
                    <div className="h-20 bg-slate-50 rounded-2xl flex items-center justify-center p-4 font-black text-slate-300 uppercase italic">UPI</div>
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'creator' && isCreator && (
            <motion.div key="creator" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
               <div className="mb-10">
                   <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Cosmic Treasury</h2>
                   <p className="text-indigo-500 font-bold uppercase tracking-widest text-xs mt-2">Administrator Financial Center</p>
                </div>
                <WithdrawalDashboard totalRevenue={12450} />
            </motion.div>
          )}

          {activeTab === 'charts' && (
             <motion.div key="charts" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                <AstrologyChart data={mockChartData} style={profile.preferences.chartStyle} title="Lagna Chart (D1)" />
                <AstrologyChart data={mockNavamshaData} style={profile.preferences.chartStyle} title="Navamsha Chart (D9)" />
                <AstrologyChart data={mockDashamshaData} style={profile.preferences.chartStyle} title="Dashamsha Chart (D10)" />
             </motion.div>
          )}

          {activeTab === 'astromaps' && (
            <motion.div key="astromaps" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
               <div className="mb-10">
                   <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Cosmic Astromaps</h2>
                   <p className="text-indigo-500 font-bold uppercase tracking-widest text-xs mt-2">Interactive Divisional Charts (Varga)</p>
                </div>
                <AstroMaps 
                  d1={mockChartData} 
                  d9={mockNavamshaData} 
                  d10={mockDashamshaData} 
                  d60={mockShashtiamshaData}
                  style={profile.preferences.chartStyle} 
                />
            </motion.div>
          )}

          {activeTab === 'timeline' && (
             <motion.div key="timeline" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[48px] p-8 md:p-12 shadow-sm">
                <div className="mb-12">
                   <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Vimshottari Dasha</h2>
                   <p className="text-indigo-500 font-bold uppercase tracking-widest text-xs mt-2">Your Biological & Spiritual Timeline</p>
                </div>
                <DashaTimeline 
                  periods={dashaPeriods} 
                  onInterpret={handleInterpretDasha} 
                  isLoading={isDashaLoading}
                />
             </motion.div>
          )}

          {activeTab === 'nadi' && (
             <motion.div key="nadi" initial={{ opacity: 0, rotateY: 90 }} animate={{ opacity: 1, rotateY: 0 }} exit={{ opacity: 0, rotateY: -90 }} className="flex justify-center">
                <ThumbAnalysis />
             </motion.div>
          )}

          {activeTab === 'refer' && profile && (
            <motion.div key="refer" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
               <div className="mb-10">
                   <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Refer & Earn</h2>
                   <p className="text-yellow-600 font-bold uppercase tracking-widest text-xs mt-2">Grow the cosmic community and earn tokens</p>
                </div>
                <ReferAndEarn userId={profile.uid} astroCoins={profile.astroCoins || 0} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showPayment && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <PaymentGateways 
                amount={paymentAmount} 
                currency="USD" 
                onSuccess={handlePaymentSuccess} 
                onCancel={() => {
                  setShowPayment(false);
                  setPendingTier(null);
                }} 
                astroCoins={profile.astroCoins || 0}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Sub-components for better organization
function TransitItem({ planet, status }: { planet: string; status: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="font-black text-indigo-900">{planet}</span>
      <span className="text-slate-500 italic font-medium">{status}</span>
    </div>
  );
}

function PaymentCard({ title, icon, details, note, color }: { title: string; icon: string; details: string; note: string; color: string }) {
  const [copied, setCopied] = useState(false);
  
  const copy = () => {
    navigator.clipboard.writeText(details);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`p-8 rounded-[40px] border-2 flex flex-col gap-6 transition-all hover:scale-105 ${color}`}>
      <div className="text-4xl">{icon}</div>
      <div>
        <h3 className="font-black text-xl mb-1">{title}</h3>
        <p className="text-xs uppercase font-black opacity-60 tracking-widest">{note}</p>
      </div>
      <div className="bg-white/50 p-4 rounded-2xl break-all font-mono text-xs font-bold border border-white">
        {details}
      </div>
      <button 
        onClick={copy}
        className="mt-auto py-3 bg-white border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
      >
        {copied ? 'Copied ✨' : 'Copy Details'}
      </button>
    </div>
  );
}

function NavButtonSidebar({ active, onClick, icon, bg, border, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; bg?: string; border?: string; label: string }) {
  return (
    <div className="group relative flex items-center">
      <div 
        onClick={onClick}
        className={`w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all ${active ? (bg || 'bg-indigo-500/40') : 'bg-white/10 hover:bg-white/20'} ${border || ''}`}
      >
        <div className={`${active ? 'text-white' : 'text-white/60'}`}>
          {React.cloneElement(icon as React.ReactElement, { size: 24 })}
        </div>
      </div>
      <span className="absolute left-16 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {label}
      </span>
    </div>
  );
}


function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
    >
      {React.cloneElement(icon as React.ReactElement, { size: 24 })}
      <span className="text-[10px] font-extrabold uppercase tracking-widest">{label}</span>
    </button>
  );
}

function MuhurtaItem({ label, time, value, color }: { label: string; time: string; value: string; color: string }) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
        <p className="text-sm font-extrabold text-slate-900">{time}</p>
      </div>
      <div className={`text-xs font-black uppercase ${color}`}>{value}</div>
    </div>
  );
}

function LoginView({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-6 bg-[#6366F1] text-center overflow-hidden">
      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="relative">
          <div className="w-32 h-32 bg-white rounded-[40px] flex items-center justify-center shadow-2xl shadow-indigo-900/50 mb-10 rotate-12">
            <Star className="w-16 h-16 text-indigo-600" />
          </div>
      </motion.div>
      <h1 className="text-7xl font-black text-white mb-6 tracking-tighter">Astroworld</h1>
      <p className="max-w-md text-indigo-100 font-bold mb-12 text-lg leading-snug">Vedic wisdom meets modern brilliance. Authentically spiritual astrologers, reimagined.</p>
      <button 
        onClick={onLogin}
        className="px-12 py-5 bg-pink-500 text-white rounded-3xl font-black text-xl hover:bg-pink-600 transition-all shadow-2xl shadow-pink-500/40 hover:scale-105 active:scale-95"
      >
        Unlock Your Path
      </button>
    </div>
  );
}

const OnboardingView = ({ onSave }: { onSave: (details: Partial<UserProfile>) => void }) => {
  const [details, setDetails] = useState({ birthDate: '', birthTime: '', birthPlace: '' });

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#6366F1] p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-50 p-10 md:p-14 rounded-[48px] w-full max-w-xl shadow-2xl flex flex-col gap-10"
      >
        <div>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">The Moment of Descent</h2>
            <p className="text-slate-500 font-medium mt-2">Define your position in the cosmic architecture.</p>
        </div>

        <div className="space-y-6">
            <div className="space-y-3">
               <label className="text-xs font-black uppercase tracking-widest text-indigo-600 ml-4">Birth Date</label>
               <input 
                 type="date" 
                 className="w-full bg-slate-100 border-2 border-slate-200 rounded-3xl p-5 text-slate-900 font-bold focus:border-indigo-500 outline-none transition-all"
                 onChange={e => setDetails({...details, birthDate: e.target.value})}
               />
            </div>
            <div className="space-y-3">
               <label className="text-xs font-black uppercase tracking-widest text-indigo-600 ml-4">Birth Time</label>
               <input 
                 type="time" 
                 className="w-full bg-slate-100 border-2 border-slate-200 rounded-3xl p-5 text-slate-900 font-bold focus:border-indigo-500 outline-none transition-all"
                 onChange={e => setDetails({...details, birthTime: e.target.value})}
               />
            </div>
            <div className="space-y-3">
               <label className="text-xs font-black uppercase tracking-widest text-indigo-600 ml-4">Birth Place</label>
               <input 
                 type="text" 
                 placeholder="Search city..."
                 className="w-full bg-slate-100 border-2 border-slate-200 rounded-3xl p-5 text-slate-900 font-bold focus:border-indigo-500 outline-none transition-all"
                 onChange={e => setDetails({...details, birthPlace: e.target.value})}
               />
            </div>
        </div>

        <button 
          onClick={() => onSave(details)}
          disabled={!details.birthDate || !details.birthTime || !details.birthPlace}
          className="w-full py-5 bg-indigo-600 text-white rounded-[32px] font-black hover:bg-indigo-700 shadow-xl shadow-indigo-600/30 transition-all disabled:opacity-20 disabled:scale-95 text-xl tracking-tight"
        >
          Generate My Cosmic Map
        </button>
      </motion.div>
    </div>
  );
};

// Mock Data Generators (representing the Calculation Engine mentioned in PDF)
const mockChartData: ChartData = {
  ascendant: 145,
  ayanamsha: 24.12,
  planets: [
    { name: 'Sun', position: 10, sign: 'Aries', house: 1, isRetrograde: false, nakshatra: 'Ashwini', pad: 1 },
    { name: 'Moon', position: 120, sign: 'Cancer', house: 4, isRetrograde: false, nakshatra: 'Pushya', pad: 2 },
    { name: 'Mars', position: 45, sign: 'Taurus', house: 2, isRetrograde: false, nakshatra: 'Rohini', pad: 3 },
    { name: 'Mercury', position: 15, sign: 'Aries', house: 1, isRetrograde: true, nakshatra: 'Ashwini', pad: 4 },
    { name: 'Jupiter', position: 240, sign: 'Sagittarius', house: 9, isRetrograde: false, nakshatra: 'Moola', pad: 1 },
    { name: 'Venus', position: 330, sign: 'Pisces', house: 12, isRetrograde: false, nakshatra: 'Revati', pad: 2 },
    { name: 'Saturn', position: 300, sign: 'Aquarius', house: 11, isRetrograde: true, nakshatra: 'Shatabhisha', pad: 3 },
    { name: 'Rahu', position: 180, sign: 'Libra', house: 7, isRetrograde: false, nakshatra: 'Swati', pad: 4 },
    { name: 'Ketu', position: 0, sign: 'Aries', house: 1, isRetrograde: false, nakshatra: 'Ashwini', pad: 4 },
  ]
};

const mockNavamshaData: ChartData = { ...mockChartData };
const mockDashamshaData: ChartData = { 
  ...mockChartData,
  planets: mockChartData.planets.map(p => ({ ...p, house: (p.house + 2) % 12 || 12 })) // simple variation for mock accuracy
};

const mockShashtiamshaData: ChartData = {
  ...mockChartData,
  planets: mockChartData.planets.map(p => ({ ...p, house: (p.house + 5) % 12 || 12 }))
};

const mockDashaPeriods: DashaPeriod[] = [
  { planet: 'Jupiter', start: new Date(1995, 4, 1), end: new Date(2011, 4, 1), level: 'mahadasha', subPeriods: [
      { planet: 'Saturn', start: new Date(1995, 4, 1), end: new Date(1997, 10, 1), level: 'antardasha' },
      { planet: 'Mercury', start: new Date(1997, 10, 1), end: new Date(2000, 2, 1), level: 'antardasha' },
    ]
  },
  { planet: 'Saturn', start: new Date(2011, 4, 1), end: new Date(2030, 4, 1), level: 'mahadasha', subPeriods: [
      { planet: 'Saturn', start: new Date(2011, 4, 1), end: new Date(2014, 5, 1), level: 'antardasha' },
      { planet: 'Mercury', start: new Date(2014, 5, 1), end: new Date(2017, 2, 1), level: 'antardasha' },
    ]
  },
  { planet: 'Mercury', start: new Date(2030, 4, 1), end: new Date(2047, 4, 1), level: 'mahadasha' },
];
