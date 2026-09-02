import { ColorSeed } from '../types';

export interface ColorScheme {
  primary: string;
  primaryLight: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  accent: string;
  badgeBg: string;
}

export const SEED_SCHEMES: Record<ColorSeed, { light: ColorScheme; dark: ColorScheme }> = {
  blue: {
    light: {
      primary: '#0061A4',
      primaryLight: '#2574BD',
      onPrimary: '#FFFFFF',
      primaryContainer: '#D1E4FF',
      onPrimaryContainer: '#001D36',
      accent: '#0061A4',
      badgeBg: '#D1E4FF',
    },
    dark: {
      primary: '#9ECAFF',
      primaryLight: '#BDE0FF',
      onPrimary: '#003258',
      primaryContainer: '#00497D',
      onPrimaryContainer: '#D1E4FF',
      accent: '#9ECAFF',
      badgeBg: '#003258',
    }
  },
  emerald: {
    light: {
      primary: '#059669',
      primaryLight: '#10B981',
      onPrimary: '#FFFFFF',
      primaryContainer: '#D1FAE5',
      onPrimaryContainer: '#064E3B',
      accent: '#10B981',
      badgeBg: '#ECFDF5',
    },
    dark: {
      primary: '#10B981',
      primaryLight: '#34D399',
      onPrimary: '#064E3B',
      primaryContainer: '#065F46',
      onPrimaryContainer: '#D1FAE5',
      accent: '#34D399',
      badgeBg: '#064E3B',
    }
  },
  purple: {
    light: {
      primary: '#7C3AED',
      primaryLight: '#8B5CF6',
      onPrimary: '#FFFFFF',
      primaryContainer: '#EDE9FE',
      onPrimaryContainer: '#4C1D95',
      accent: '#8B5CF6',
      badgeBg: '#F5F3FF',
    },
    dark: {
      primary: '#A78BFA',
      primaryLight: '#C4B5FD',
      onPrimary: '#3B0764',
      primaryContainer: '#5B21B6',
      onPrimaryContainer: '#EDE9FE',
      accent: '#C4B5FD',
      badgeBg: '#4C1D95',
    }
  },
  amber: {
    light: {
      primary: '#D97706',
      primaryLight: '#F59E0B',
      onPrimary: '#FFFFFF',
      primaryContainer: '#FEF3C7',
      onPrimaryContainer: '#78350F',
      accent: '#F59E0B',
      badgeBg: '#FFFBEB',
    },
    dark: {
      primary: '#FBBF24',
      primaryLight: '#FCD34D',
      onPrimary: '#451A03',
      primaryContainer: '#78350F',
      onPrimaryContainer: '#FEF3C7',
      accent: '#FCD34D',
      badgeBg: '#78350F',
    }
  }
};

export function getTonalColors(seed: ColorSeed, dark: boolean): ColorScheme {
  return SEED_SCHEMES[seed][dark ? 'dark' : 'light'];
}

export function formatTimeAgo(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 45) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
