import { setSessionExpiredHandler } from '@/apis/client';
import { AuthLoadingScreen } from '@/components/auth/AuthLoadingScreen';
import { useAuthStore } from '@/stores/authStore';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
} from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useColorScheme } from 'react-native';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [loaded] = useFonts({
    PretendardRegular: require('../../assets/fonts/Pretendard-Regular.otf'),
    PretendardMedium: require('../../assets/fonts/Pretendard-Medium.otf'),
    PretendardSemiBold: require('../../assets/fonts/Pretendard-SemiBold.otf'),
    PretendardBold: require('../../assets/fonts/Pretendard-Bold.otf'),
  });

  const colorScheme = useColorScheme();
  const status = useAuthStore((state) => state.status);
  const initialize = useAuthStore((state) => state.initialize);
  const initializedRef = useRef(false);
  const [minimumSplashElapsed, setMinimumSplashElapsed] = useState(false);

  useEffect(() => {
    return setSessionExpiredHandler(() => useAuthStore.getState().expireSession());
  }, []);

  useEffect(() => {
    if (!loaded) return;

    if (!initializedRef.current) {
      initializedRef.current = true;
      SplashScreen.hideAsync().catch(() => undefined);
      initialize();
    }

    const timeout = setTimeout(() => setMinimumSplashElapsed(true), 500);
    return () => clearTimeout(timeout);
  }, [initialize, loaded]);

  if (!loaded) {
    return null;
  }

  if (!minimumSplashElapsed || status === 'initializing') {
    return <AuthLoadingScreen />;
  }

  return (
    <ThemeProvider
      value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={status === 'unauthenticated'}>
          <Stack.Screen name="login" />
        </Stack.Protected>
        <Stack.Protected guard={status === 'authenticated'}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="festival-detail" />
          <Stack.Screen name="festival-search" />
          <Stack.Screen name="tour-search" />
          <Stack.Screen name="visit" />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}
