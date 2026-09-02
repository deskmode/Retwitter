import React from 'react';
import { Home, Search, PlusCircle, Bell, User } from 'lucide-react';
import { ActiveTab } from '../types';
import { useTheme } from '../context/ThemeContext';
import { getTonalColors } from '../utils/themeTokens';

interface MainNavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  unreadCount: number;
}

export const MainNavigation: React.FC<MainNavigationProps> = ({
  activeTab,
  onSelectTab,
  unreadCount,
}) => {
  const { resolvedDark, colorSeed } = useTheme();
  const colors = getTonalColors(colorSeed, resolvedDark);

  const tabs: Array<{ id: ActiveTab; label: string; icon: React.ReactNode; activeIcon: React.ReactNode; badge?: number }> = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home size={22} />,
      activeIcon: <Home size={22} className="stroke-[2.5]" />,
    },
    {
      id: 'search',
      label: 'Search',
      icon: <Search size={22} />,
      activeIcon: <Search size={22} className="stroke-[2.5]" />,
    },
    {
      id: 'post',
      label: 'Post',
      icon: <PlusCircle size={22} />,
      activeIcon: <PlusCircle size={22} className="stroke-[2.5]" />,
    },
    {
      id: 'notifications',
      label: 'Alerts',
      icon: <Bell size={22} />,
      activeIcon: <Bell size={22} className="stroke-[2.5]" />,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User size={22} />,
      activeIcon: <User size={22} className="stroke-[2.5]" />,
    },
  ];

  return (
    <nav
      className={`h-16 w-full px-2 flex items-center justify-around shrink-0 border-t select-none transition-colors z-20 ${
        resolvedDark
          ? 'bg-[#111418] border-slate-800 text-slate-400'
          : 'bg-[#FFFFFF] border-[#F0F2F5] text-[#535F70]'
      }`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className="flex-1 flex flex-col items-center justify-center py-1 group focus:outline-none transition-transform active:scale-95"
          >
            {/* Pill Container for Material 3 Navigation Destination */}
            <div
              className={`relative px-4 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                isActive
                  ? resolvedDark
                    ? 'bg-[#00497D] text-[#D1E4FF] font-semibold'
                    : 'bg-[#D1E4FF] text-[#001D36] font-semibold'
                  : 'text-[#74777F] dark:text-slate-400 group-hover:text-[#1A1C1E] dark:group-hover:text-slate-200'
              }`}
            >
              {isActive ? tab.activeIcon : tab.icon}

              {/* Badge indicator */}
              {tab.badge !== undefined && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md animate-pulse">
                  {tab.badge > 9 ? '9+' : tab.badge}
                </span>
              )}
            </div>

            {/* Label */}
            <span
              className={`text-[11px] mt-0.5 tracking-tight transition-colors ${
                isActive
                  ? 'font-bold text-[#0061A4] dark:text-[#9ECAFF]'
                  : 'font-normal opacity-80 text-[#535F70] dark:text-slate-400'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
