import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal, Smartphone, Maximize2, Minimize2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AndroidFrameProps {
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children }) => {
  const { isDeviceFrame, setIsDeviceFrame, resolvedDark } = useTheme();
  const [time, setTime] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const h = d.getHours().toString().padStart(2, '0');
      const m = d.getMinutes().toString().padStart(2, '0');
      setTime(`${h}:${m}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      resolvedDark ? 'bg-[#0E121A] text-[#E2E2E6]' : 'bg-[#F0F2F5] text-[#1A1C1E]'
    }`}>
      {/* Sleek Interface Top Dashboard Header */}
      <header className={`h-16 px-4 sm:px-6 flex items-center justify-between border-b shrink-0 z-30 transition-colors ${
        resolvedDark
          ? 'bg-[#141923] border-[#2E3544] text-[#E2E2E6]'
          : 'bg-[#FDFBFF] border-[#E0E2EC] text-[#1A1C1E] shadow-xs'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0061A4] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-sm tracking-tight select-none">
            R
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight">
              ReTwitter Dashboard
            </h1>
            <span className={`text-xs font-medium ${resolvedDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Project Blueprint v1.0
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          {/* Build Status Indicator */}
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Build Status
            </span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Production Ready</span>
            </div>
          </div>

          {/* Viewport switch toggle */}
          <button
            onClick={() => setIsDeviceFrame(!isDeviceFrame)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-2xs active:scale-95 ${
              resolvedDark
                ? 'bg-[#1C2331] border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
                : 'bg-white border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400'
            }`}
            title={isDeviceFrame ? 'Switch to responsive full-screen' : 'Switch to Android phone frame'}
          >
            <Smartphone size={14} className="text-[#0061A4] dark:text-[#9ECAFF]" />
            <span className="hidden sm:inline">{isDeviceFrame ? 'Full Viewport' : 'Phone Frame'}</span>
            {isDeviceFrame ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
          </button>
        </div>
      </header>

      {/* Main Screen Canvas */}
      <main className="flex-1 w-full flex items-center justify-center p-2 sm:p-5 overflow-hidden">
        {isDeviceFrame ? (
          <div className="relative w-full max-w-[420px] h-[91vh] max-h-[860px] min-h-[620px] rounded-[40px] border-[8px] border-[#1A1C1E] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col transition-all duration-300 bg-white dark:bg-[#111418]">
            {/* Status Bar */}
            <div className={`h-8 w-full flex items-center justify-between px-6 shrink-0 z-30 select-none ${
              resolvedDark ? 'bg-[#111418] text-slate-200' : 'bg-[#FDFBFF] text-[#1A1C1E] border-b border-[#F0F2F5]'
            }`}>
              <span className="text-[12px] font-bold tracking-tight">{time}</span>
              {/* Punch hole camera */}
              <div className="w-3.5 h-3.5 rounded-full bg-[#1A1C1E] border border-slate-700/50 shadow-inner"></div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Signal size={12} />
                <Wifi size={12} />
                <Battery size={13} className="text-emerald-500" />
              </div>
            </div>

            {/* Screen Viewport */}
            <div className="flex-1 w-full overflow-hidden flex flex-col relative">
              {children}
            </div>

            {/* Android System Navigation Gesture Bar */}
            <div className={`h-4 w-full flex items-center justify-center shrink-0 z-30 ${
              resolvedDark ? 'bg-[#111418]' : 'bg-[#FDFBFF]'
            }`}>
              <div className="w-28 h-1 rounded-full bg-slate-400/40"></div>
            </div>
          </div>
        ) : (
          <div className={`w-full max-w-2xl h-[92vh] rounded-3xl shadow-xl overflow-hidden flex flex-col transition-all duration-300 border ${
            resolvedDark ? 'bg-[#111418] border-slate-800' : 'bg-[#FDFBFF] border-[#E0E2EC]'
          }`}>
            {children}
          </div>
        )}
      </main>
    </div>
  );
};
