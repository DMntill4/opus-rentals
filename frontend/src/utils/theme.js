// Theme helper permanently locked to Light mode per user requirements
const THEME_STORAGE_KEY = 'opus_theme';

export const themeManager = {
  isDark: false,

  init() {
    localStorage.removeItem(THEME_STORAGE_KEY);
    this.apply();
  },

  getTheme() {
    return 'light';
  },

  toggleTheme() {
    // Dark mode is permanently disabled
    this.isDark = false;
    this.apply();
  },

  apply() {
    const root = document.documentElement;
    root.classList.remove('dark');
    document.body.classList.remove('bg-slate-950', 'text-slate-100');
    document.body.classList.add('bg-[#f8fafc]', 'text-slate-800');
  }
};
