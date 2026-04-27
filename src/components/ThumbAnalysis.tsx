import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scan, Fingerprint, Sparkles, Camera, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { getThumbInterpretation } from '../services/geminiService';

export const ThumbAnalysis = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<'idle' | 'auth' | 'camera' | 'analyzing'>('idle');
  const [cameraStage, setCameraStage] = useState<'calibrating' | 'focusing' | 'ready' | 'captured'>('calibrating');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startScan = async () => {
    setError(null);
    setIsScanning(true);
    
    // Step 1: Biometric Verification Simulation
    setScanStep('auth');
    try {
      if (window.isSecureContext && window.PublicKeyCredential) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    } catch (e) {
      console.warn("Biometric check skipped or failed:", e);
    }

    // Step 2: Camera Capture
    setScanStep('camera');
    setCameraStage('calibrating');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 480 },
          height: { ideal: 640 }
        } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Simulation Stages
      await new Promise(resolve => setTimeout(resolve, 1500)); // Calibrating
      setCameraStage('focusing');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Focusing
      setCameraStage('ready');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Hold still
      
      setScanStep('analyzing');
      setCameraStage('captured');
      // "Capture" - just a visual pause in this simulation
      if (videoRef.current) videoRef.current.pause();

      const patterns = ['Shankha', 'Chakra', 'Padma', 'Gaja'];
      const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];

      try {
        const aiResponse = await getThumbInterpretation(selectedPattern);
        setResult(aiResponse);
      } catch (aiErr) {
        console.error("AI Analysis failed:", aiErr);
        // Fallback
        const fallbacks: Record<string, string> = {
          'Shankha': "Shankha Nadi (The Conch) - You possess deep intuition and a creative spirit. Your path involves spiritual leadership and artistic expression.",
          'Chakra': "Chakra Nadi (The Wheel) - Your thumb pattern reveals a master of strategy and commerce. Abundance flows through your ability to organize and lead.",
          'Padma': "Padma Nadi (The Lotus) - A pure heart and healing hands. Your destiny is linked to the service of others and the mastery of calm.",
          'Gaja': "Gaja Nadi (The Elephant) - Immense strength of character. You are the pillar upon which others lean; success through perseverance is your birthright."
        };
        setResult(fallbacks[selectedPattern]);
      }
      
      setIsScanning(false);
      setScanStep('idle');
      stopCamera();
    } catch (err) {
      console.error("Camera access denied:", err);
      setError("Camera access is required for thumb impression analysis.");
      setIsScanning(false);
      setScanStep('idle');
      stopCamera();
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="bg-white rounded-[48px] p-10 max-w-md mx-auto text-center shadow-xl border border-slate-100">
      <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Nadi Reader</h2>
      <p className="text-sm text-slate-400 mb-10 font-medium">Digital macro-impression analysis</p>

      <div className="relative w-64 h-80 mx-auto mb-10 bg-slate-900 rounded-[40px] border-4 border-white shadow-2xl overflow-hidden flex flex-col items-center justify-center group">
        <AnimatePresence mode="wait">
          {!isScanning && !result && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startScan}
                className="relative z-10 p-10 rounded-[32px] bg-white text-indigo-600 shadow-xl hover:shadow-indigo-500/20 transition-all cursor-pointer"
              >
                <Fingerprint className="w-16 h-16" />
              </motion.button>
              <p className="text-[10px] font-black text-white uppercase tracking-widest px-8">Place thumb on scanner to begin</p>
            </motion.div>
          )}

          {isScanning && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 w-full h-full flex items-center justify-center"
            >
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted 
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 via-transparent to-indigo-900/40 pointer-events-none" />

              <div className="relative z-10 text-white flex flex-col items-center gap-4">
                {scanStep === 'auth' && (
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity }} className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                      <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Biometric Check...</span>
                  </motion.div>
                )}
                {scanStep === 'camera' && (
                  <div className="flex flex-col items-center gap-4 w-full px-6">
                    <div className="relative w-48 h-64 flex items-center justify-center">
                      {/* Focus Box */}
                      <motion.div 
                        initial={{ scale: 1.2, borderColor: 'rgba(239, 68, 68, 0.5)' }}
                        animate={{ 
                          scale: cameraStage === 'focusing' ? [1.2, 1, 1.1, 1] : 1,
                          borderColor: cameraStage === 'ready' ? 'rgba(34, 197, 94, 0.8)' : 
                                       cameraStage === 'focusing' ? 'rgba(234, 179, 8, 0.8)' : 
                                       'rgba(239, 68, 68, 0.5)',
                        }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 border-2 rounded-2xl z-20 pointer-events-none"
                      >
                         {/* Focus corners */}
                         <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-inherit translate-x--0.5 translate-y--0.5" />
                         <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-inherit translate-x-0.5 translate-y--0.5" />
                         <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-inherit translate-x--0.5 translate-y-0.5" />
                         <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-inherit translate-x-0.5 translate-y-0.5" />
                      </motion.div>

                      {/* Lighting Flicker Simulation */}
                      <motion.div 
                        animate={{ opacity: [0, 0.15, 0.05, 0.2, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 bg-white shadow-[inset_0_0_50px_rgba(255,255,255,0.3)] rounded-2xl z-10 pointer-events-none"
                      />

                      <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] rounded-2xl overflow-hidden">
                        <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-0.5 bg-white/20" />
                      </div>

                      {/* Target Indicator */}
                      <Fingerprint className={`w-16 h-16 transition-all duration-1000 ${cameraStage === 'ready' ? 'text-green-400 scale-110 opacity-40' : 'text-white/20'}`} />
                    </div>

                    <span className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse text-white/80">
                      {cameraStage === 'calibrating' && 'Optics Calibration...'}
                      {cameraStage === 'focusing' && 'Adjusting Macro Focus...'}
                      {cameraStage === 'ready' && 'Ready. Hold Still.'}
                    </span>
                  </div>
                )}
                {scanStep === 'analyzing' && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-indigo-400 border-t-white rounded-full animate-spin" />
                    <span className="text-xs font-black uppercase tracking-widest">Deciphering Nadi Shastra...</span>
                  </div>
                )}
              </div>

              {/* Scanning laser line */}
              {scanStep !== 'auth' && (
                <motion.div
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_30px_rgba(99,102,241,1)] z-20"
                />
              )}
            </motion.div>
          )}

          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-slate-900 overflow-y-auto p-8 text-white text-left z-30 scrollbar-hide"
            >
              <div className="flex justify-center mb-6">
                <Sparkles className="w-10 h-10 text-pink-400" />
              </div>
              <h4 className="text-xl font-black mb-4 text-center text-indigo-400">Nadi Revelation</h4>
              <div 
                className="text-xs leading-relaxed space-y-4 font-medium" 
                dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b class="text-indigo-300">$1</b>') }} 
              />
              <div className="flex justify-center mt-10">
                <button 
                  onClick={() => setResult(null)}
                  className="py-4 px-8 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                >
                  Clear Reading
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="absolute bottom-6 left-6 right-6 p-4 bg-red-500/90 backdrop-blur-md rounded-2xl text-white text-[10px] font-black uppercase flex items-center gap-3">
             <AlertCircle size={16} />
             {error}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
          {scanStep === 'idle' ? 'Ready for Impression' : 'Secure Session Active'}
        </p>
        <p className="text-[8px] italic text-slate-300 font-medium">The print is cleared immediately after analysis.</p>
      </div>
    </div>
  );
};
