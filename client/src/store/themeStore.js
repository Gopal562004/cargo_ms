import { create } from 'zustand';

function applyThemeClasses(theme) {
  if (typeof document === 'undefined') return;
  const isLight = theme === 'light';
  if (isLight) {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
  } else {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  }
}

export const useThemeStore = create((set) => ({
  theme: (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) || 'dark', // 'dark' | 'light'
  
  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', nextTheme);
    }
    applyThemeClasses(nextTheme);
    return { theme: nextTheme };
  }),
  
  setTheme: (newTheme) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
    applyThemeClasses(newTheme);
    set({ theme: newTheme });
  },

  initTheme: () => {
    const savedTheme = (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) || 'dark';
    applyThemeClasses(savedTheme);
    set({ theme: savedTheme });
  },
}));
