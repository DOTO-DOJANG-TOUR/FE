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
  const storedStatus = useAuthStore((state) => state.status);
  const status = storedStatus;
  // [LOCAL-DEMO ONLY] 가상폰 시연이 필요할 때만 위 줄을 주석 처리하고,
  // 아래 줄의 주석을 해제한다. 이 우회는 인증 여부와 무관하게 탭 화면을 열므로 커밋하면 안 된다.
  // const status = __DEV__ ? 'authenticated' : storedStatus;
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
          <Stack.Screen name="search" />
          <Stack.Screen name="visit" />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}
