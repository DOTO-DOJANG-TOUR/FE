import { setSessionExpiredHandler } from '@/apis/client';
import { AuthLoadingScreen } from '@/components/auth/AuthLoadingScreen';
import { TourVisitRestoreErrorScreen } from '@/components/tour/TourVisitRestoreErrorScreen';
import { useAuthStore } from '@/stores/authStore';
import { useTourVisitStore } from '@/stores/tourVisitStore';
import { useFonts } from 'expo-font';
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { AppState, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [loaded, fontError] = useFonts({
    PretendardRegular: require('../../assets/fonts/Pretendard-Regular.otf'),
    PretendardMedium: require('../../assets/fonts/Pretendard-Medium.otf'),
    PretendardSemiBold: require('../../assets/fonts/Pretendard-SemiBold.otf'),
    PretendardBold: require('../../assets/fonts/Pretendard-Bold.otf'),
  });

  const [nativeSplashHidden, setNativeSplashHidden] = useState(false);
  const [customSplashElapsed, setCustomSplashElapsed] = useState(false);

  const splashTransitionStartedRef = useRef(false);

  const handleSplashLayout = async () => {
    if (splashTransitionStartedRef.current) return;

    splashTransitionStartedRef.current = true;

    try {
      await SplashScreen.hideAsync();
    } finally {
      setNativeSplashHidden(true);
    }
  };

  useEffect(() => {
    if (!nativeSplashHidden) return;

    const timeout = setTimeout(() => {
      setCustomSplashElapsed(true);
    }, 1600);

    return () => clearTimeout(timeout);
  }, [nativeSplashHidden]);

  const colorScheme = useColorScheme();
  const storedStatus = useAuthStore((state) => state.status);
  const status = storedStatus;
  // [LOCAL-DEMO ONLY] 가상폰 시연이 필요할 때만 위 줄을 주석 처리하고,
  // 아래 줄의 주석을 해제한다. 이 우회는 인증 여부와 무관하게 탭 화면을 열므로 커밋하면 안 된다.
  // const status = __DEV__ ? 'authenticated' : storedStatus;
  const initialize = useAuthStore((state) => state.initialize);
  const initializedRef = useRef(false);

  const tourVisitStatus = useTourVisitStore((state) => state.status);
  const restoreTourVisit = useTourVisitStore((state) => state.restore);
  const tourVisitRestoredRef = useRef(false);

  useEffect(() => {
    return setSessionExpiredHandler(() => useAuthStore.getState().expireSession());
  }, []);

  useEffect(() => {
    if (!loaded && !fontError) return;

    if (!initializedRef.current) {
      initializedRef.current = true;
      initialize();
    }

  }, [initialize, loaded, fontError]);

  // 일반 화면을 렌더링하기 전에 활성 방문 관광지를 조회해 화면 잠금 여부를 정한다.
  useEffect(() => {
    if (status === 'authenticated' && !tourVisitRestoredRef.current) {
      tourVisitRestoredRef.current = true;
      restoreTourVisit();
    }
    if (status === 'unauthenticated') {
      tourVisitRestoredRef.current = false;
    }
  }, [status, restoreTourVisit]);

  // 앱이 포그라운드로 돌아올 때마다 활성 방문 상태를 다시 확인한다.
  useEffect(() => {
    if (status !== 'authenticated') return;

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') restoreTourVisit();
    });
    return () => subscription.remove();
  }, [status, restoreTourVisit]);

  const restoringTourVisit =
    status === 'authenticated' &&
    tourVisitStatus === 'restoring';

  const appReady =
    (loaded || !!fontError) &&
    status !== 'initializing' &&
    !restoringTourVisit;

  const ready =
    appReady &&
    nativeSplashHidden &&
    customSplashElapsed;

  const fontsReady = loaded || !!fontError;

  if (!fontsReady) {
    return null;
  }

  if (!ready) {
    return (
      <AuthLoadingScreen
        onLayout={handleSplashLayout}
      />
    );
  }

  if (status === 'authenticated' && tourVisitStatus === 'error') {
    return <TourVisitRestoreErrorScreen onRetry={restoreTourVisit} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider
        value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={status === 'unauthenticated'}>
            <Stack.Screen name="login" />
          </Stack.Protected>
          <Stack.Protected
            guard={status === 'authenticated' && tourVisitStatus !== 'active'}
          >
            {/* 축제 상세에서 도장 투어를 시작하고 투어 탭으로 넘어갈 때(기본 전환) 새 화면이
                배경색으로 칠해지기 전 잠깐 흰 화면이 보이던 문제 — visit 화면과 같은 방식으로
                완화한다. */}
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
            <Stack.Screen name="festival-detail/[id]" />
            <Stack.Screen name="search" />
            <Stack.Screen name="visit" options={{ animation: 'fade' }} />
            <Stack.Screen name="stamp-detail/[id]" />
          </Stack.Protected>
          <Stack.Protected guard={status === 'authenticated'}>
            <Stack.Screen name="check-in" />
          </Stack.Protected>
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
