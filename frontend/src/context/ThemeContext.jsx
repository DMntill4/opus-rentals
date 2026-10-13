import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('opus_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [lang, setLang] = useState(() => {
    return localStorage.getItem('opus_lang') || 'es';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('opus_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('opus_theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('opus_lang', lang);
  }, [lang]);

  const toggleTheme = () => setIsDark((prev) => !prev);
  const toggleLang = () => setLang((prev) => (prev === 'es' ? 'en' : 'es'));

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, lang, toggleLang, setLang }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
