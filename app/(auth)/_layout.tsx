// app/_layout.tsx
import { ThemeProvider, useTheme } from '@/context/ThemeContext'; // <-- Import your new provider
import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// This inner component consumes the theme to change the top status bar (battery/clock)
function RootLayoutNav() {
  const { colorScheme } = useTheme();

  return (
    <NavThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
       <Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="welcome" /> 
  <Stack.Screen name="login" />
  <Stack.Screen name="(tabs)" />
</Stack>
      </Stack>
      {/* This changes the battery/clock color based on dark mode! */}
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </NavThemeProvider>
  );
}

// Wrap the whole app so the context is available everywhere
export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}