import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode, ColorSeed } from '../types';

interface ThemeContextType {
  mode: ThemeMode;
  colorSeed: ColorSeed;
  isDeviceFrame: boolean;
  setMode: (mode: ThemeMode) => void;
  setColorSeed: (seed: ColorSeed) => void;
  setIsDeviceFrame: (val: boolean) => void;
  resolvedDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('retwitter_theme_mode') as ThemeMode) || 'dark';
  });

  const [colorSeed, setColorSeed] = useState<ColorSeed>(() => {
    return (localStorage.getItem('retwitter_color_seed') as ColorSeed) || 'blue';
  });

  const [isDeviceFrame, setIsDeviceFrame] = useState<boolean>(() => {
    const saved = localStorage.getItem('retwitter_device_frame');
    return saved !== null ? saved === 'true' : true; // Default to mobile phone frame for Android-first preview
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const resolvedDark = mode === 'dark' || (mode === 'system' && systemPrefersDark);

  useEffect(() => {
    localStorage.setItem('retwitter_theme_mode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('retwitter_color_seed', colorSeed);
  }, [colorSeed]);

  useEffect(() => {
    localStorage.setItem('retwitter_device_frame', String(isDeviceFrame));
  }, [isDeviceFrame]);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        colorSeed,
        isDeviceFrame,
        setMode,
        setColorSeed,
        setIsDeviceFrame,
        resolvedDark,
      }}
    >
      <div className={resolvedDark ? 'dark' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
