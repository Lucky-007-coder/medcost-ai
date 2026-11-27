import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem('medcost_theme') || 'system';
    } catch {
      return 'system';
    }
  });

  const [resolvedTheme, setResolvedTheme] = useState('light');

  const applyTheme = (themeValue) => {
    const root = document.documentElement;
    let effectiveDark = false;

    if (themeValue === 'dark') {
      effectiveDark = true;
    } else if (themeValue === 'light') {
      effectiveDark = false;
    } else {
      // system
      effectiveDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    if (effectiveDark) {
      root.classList.add('dark');
      setResolvedTheme('dark');
    } else {
      root.classList.remove('dark');
      setResolvedTheme('light');
    }
  };

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('medcost_theme', newTheme);
    } catch {}
    applyTheme(newTheme);
  };

  useEffect(() => {
    applyTheme(theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemChange);
      return () => mediaQuery.removeEventListener('change', handleSystemChange);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, isDark: resolvedTheme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
