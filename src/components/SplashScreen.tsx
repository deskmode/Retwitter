import React, { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SplashScreenProps {
  onDismiss: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDismiss }) => {
  const { resolvedDark } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-8 select-none transition-colors ${
        resolvedDark ? 'bg-[#111418] text-[#E2E2E6]' : 'bg-[#0061A4] text-white'
      }`}
    >
      <div />

      {/* Center ReTwitter Branding */}
      <div className="flex flex-col items-center text-center space-y-4 animate-scaleUp">
        <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl relative">
          {/* Custom Stylized Bird Logo */}
          <svg className="w-12 h-12 text-white fill-current" viewBox="0 0 24 24">
            <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/>
          </svg>
          <Sparkles size={16} className="absolute -top-1 -right-1 text-amber-300 animate-bounce" />
        </div>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">ReTwitter</h1>
          <p className="text-xs opacity-80 mt-1 font-medium">Android-first · Material Design 3 · Supabase</p>
        </div>
      </div>

      {/* Bottom Loading Indicator */}
      <div className="flex flex-col items-center space-y-3">
        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        <button
          onClick={onDismiss}
          className="text-xs opacity-75 hover:opacity-100 underline underline-offset-4"
        >
          Skip to app
        </button>
      </div>
    </div>
  );
};
