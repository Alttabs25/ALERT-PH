// hooks/use-color-scheme.ts
import { useTheme } from '@/context/ThemeContext';

export function useColorScheme() {
  const { colorScheme } = useTheme();
  return colorScheme;
}