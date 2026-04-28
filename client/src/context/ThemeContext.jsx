import { createContext, useContext, useState } from 'react';

export const themes = {
  indigo: {
    id: 'indigo', label: 'Indigo', dot: '#6366f1',
    gradient: 'from-indigo-50 via-white to-purple-50',
    iconBg: 'bg-indigo-600', iconShadow: 'shadow-indigo-200',
    btn: 'bg-indigo-600 hover:bg-indigo-700',
    progress: 'bg-indigo-500',
    tab: 'text-indigo-700',
    badge: 'bg-indigo-100 text-indigo-600',
    ring: 'focus:ring-indigo-400',
    accent: '#6366f1',
    statColor: 'text-indigo-600', statBg: 'bg-indigo-50 border-indigo-100',
  },
  rose: {
    id: 'rose', label: 'Rose', dot: '#f43f5e',
    gradient: 'from-rose-50 via-white to-pink-50',
    iconBg: 'bg-rose-500', iconShadow: 'shadow-rose-200',
    btn: 'bg-rose-500 hover:bg-rose-600',
    progress: 'bg-rose-500',
    tab: 'text-rose-600',
    badge: 'bg-rose-100 text-rose-600',
    ring: 'focus:ring-rose-400',
    accent: '#f43f5e',
    statColor: 'text-rose-600', statBg: 'bg-rose-50 border-rose-100',
  },
  emerald: {
    id: 'emerald', label: 'Emerald', dot: '#10b981',
    gradient: 'from-emerald-50 via-white to-teal-50',
    iconBg: 'bg-emerald-600', iconShadow: 'shadow-emerald-200',
    btn: 'bg-emerald-600 hover:bg-emerald-700',
    progress: 'bg-emerald-500',
    tab: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-600',
    ring: 'focus:ring-emerald-400',
    accent: '#10b981',
    statColor: 'text-emerald-600', statBg: 'bg-emerald-50 border-emerald-100',
  },
  amber: {
    id: 'amber', label: 'Amber', dot: '#f59e0b',
    gradient: 'from-amber-50 via-white to-orange-50',
    iconBg: 'bg-amber-500', iconShadow: 'shadow-amber-200',
    btn: 'bg-amber-500 hover:bg-amber-600',
    progress: 'bg-amber-500',
    tab: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-600',
    ring: 'focus:ring-amber-400',
    accent: '#f59e0b',
    statColor: 'text-amber-600', statBg: 'bg-amber-50 border-amber-100',
  },
  violet: {
    id: 'violet', label: 'Violet', dot: '#8b5cf6',
    gradient: 'from-violet-50 via-white to-purple-50',
    iconBg: 'bg-violet-600', iconShadow: 'shadow-violet-200',
    btn: 'bg-violet-600 hover:bg-violet-700',
    progress: 'bg-violet-500',
    tab: 'text-violet-700',
    badge: 'bg-violet-100 text-violet-600',
    ring: 'focus:ring-violet-400',
    accent: '#8b5cf6',
    statColor: 'text-violet-600', statBg: 'bg-violet-50 border-violet-100',
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(
    () => localStorage.getItem('todo-theme') || 'indigo'
  );

  const setTheme = (id) => {
    setThemeId(id);
    localStorage.setItem('todo-theme', id);
  };

  return (
    <ThemeContext.Provider value={{ theme: themes[themeId], setTheme, themeId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
