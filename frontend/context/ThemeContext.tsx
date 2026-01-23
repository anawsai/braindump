import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';

type ThemeColors = {
  // Background colors
  background: string;
  surface: string;
  surfaceSecondary: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  
  // Brand colors (stay consistent)
  primary: string;
  primaryDark: string;
  accent: string;
  
  // UI colors
  border: string;
  icon: string;
  error: string;
  success: string;
  
  // Specific component colors
  sidebar: string;
  card: string;
  input: string;
  placeholder: string;
};

type ThemeContextType = {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
};

const lightTheme: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F7F4F1',
  surfaceSecondary: '#FFDBB0',
  
  text: '#000000',
  textSecondary: '#666666',
  
  primary: '#FFB052',
  primaryDark: '#FF8D05',
  accent: '#C9731E',
  
  border: '#E0E0E0',
  icon: '#000000',
  error: '#FF5500',
  success: '#4CAF50',
  
  sidebar: '#FFB052',
  card: '#FFDBB0',
  input: '#F3F4F6',
  placeholder: '#999999',
};

const darkTheme: ThemeColors = {
  background: '#1A1A1A',
  surface: '#2A2A2A',
  surfaceSecondary: '#3A3A3A',
  
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  
  primary: '#FFB052',
  primaryDark: '#FF8D05',
  accent: '#C9731E',
  
  border: '#404040',
  icon: '#FFFFFF',
  error: '#FF5500',
  success: '#4CAF50',
  
  sidebar: '#2A2A2A',
  card: '#3A3A3A',
  input: '#2A2A2A',
  placeholder: '#666666',
};

const THEME_STORAGE_KEY = '@braindump_theme';

const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference on mount
  useEffect(() => {
    loadTheme();
  }, []);

  async function loadTheme() {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setMode(savedTheme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveTheme(newMode: ThemeMode) {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    saveTheme(newMode);
  };

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
    saveTheme(newMode);
  };

  const colors = mode === 'light' ? lightTheme : darkTheme;

  // Don't render children until theme is loaded
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ mode, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}