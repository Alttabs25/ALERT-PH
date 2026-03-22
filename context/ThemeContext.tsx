// context/ThemeContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  colorScheme: 'light' | 'dark';
};

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleDarkMode: () => {},
  colorScheme: 'light',
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useSystemColorScheme();
  // Default to system theme initially
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load the saved theme when the app starts
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('app-theme');
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  // The function your Settings toggle switch will call
  const toggleDarkMode = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('app-theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const colorScheme = isDarkMode ? 'dark' : 'light';

  // Prevent flicker while checking local storage
  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, colorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};