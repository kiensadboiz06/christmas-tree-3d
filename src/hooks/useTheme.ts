import { useState, useCallback, useRef } from 'react';
import { THEMES, THEME_ORDER } from '../constants/config';
import type { ThemeType, ThemeColors } from '../types';

export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('christmas');
  const lastThemeChangeRef = useRef<number>(0);
  
  // Debounce theme change to prevent rapid switching
  const THEME_CHANGE_COOLDOWN = 1500; // 1.5 seconds

  const cycleTheme = useCallback(() => {
    const now = Date.now();
    if (now - lastThemeChangeRef.current < THEME_CHANGE_COOLDOWN) {
      return; // Still in cooldown
    }
    
    lastThemeChangeRef.current = now;
    setCurrentTheme(prev => {
      const currentIndex = THEME_ORDER.indexOf(prev);
      const nextIndex = (currentIndex + 1) % THEME_ORDER.length;
      return THEME_ORDER[nextIndex];
    });
  }, []);

  const themeColors: ThemeColors = THEMES[currentTheme];

  return {
    currentTheme,
    themeColors,
    cycleTheme,
    setTheme: setCurrentTheme
  };
};

