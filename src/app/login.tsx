import { signInWithSocialToken } from '@/apis/auth';
import { SocialLoginButton } from '@/components/auth/SocialLoginButton';
import { DotoBrandIcon } from '@/components/icons';
import { Colors, FontFamily, FontSize } from '@/constants/theme';
import { requestSocialIdToken } from '@/services/socialOAuth';
import { useAuthStore } from '@/stores/authStore';
import type { SocialProvider } from '@/types/auth';
import { useState } from 'react';
import { Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { height: windowHeight } = useWindowDimensions();
  const completeSignIn = useAuthStore((state) => state.completeSignIn);
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (provider: SocialProvider) => {
    setErrorMessage(null);
    setLoadingProvider(provider);

    try {
      const idToken = await requestSocialIdToken(provider);
      const session = await signInWithSocialToken(provider, idToken);
      await completeSignIn(session);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : '로그인 중 문제가 발생했습니다. 다시 시도해 주세요.',
      );
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View
        style={[
          styles.container,
          Platform.OS === 'web' && { height: Math.min(windowHeight, 852) },
        ]}
      >
        <View style={styles.hero}>
          <DotoBrandIcon />
          <Text style={styles.title}>
            축제 관광을 <Text style={styles.highlight}>도장 투어</Text>로
          </Text>
          <Text style={styles.logo}>DOTO</Text>
          <Text style={styles.description}>지금 가입하고 도투와 투어 시작해요</Text>
        </View>

        <View style={styles.footer}>
          {errorMessage ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {errorMessage}
            </Text>
          ) : null}
          <SocialLoginButton
            provider="GOOGLE"
            loading={loadingProvider === 'GOOGLE'}
            disabled={loadingProvider !== null}
            onPress={() => handleLogin('GOOGLE')}
          />
          <SocialLoginButton
            provider="KAKAO"
            loading={loadingProvider === 'KAKAO'}
            disabled={loadingProvider !== null}
            onPress={() => handleLogin('KAKAO')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Platform.select({ web: '#FAFAFA', default: Colors.gray.gray00 }),
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 393,
    paddingHorizontal: 25,
    paddingBottom: 18,
    backgroundColor: Colors.gray.gray00,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 24px rgba(38, 38, 38, 0.10)',
      },
      default: {},
    }),
  },
  hero: {
    marginTop: 180,
    alignItems: 'flex-start',
  },
  title: {
    marginTop: 8,
    color: Colors.gray.gray100,
    fontFamily: FontFamily.semiBold,
    fontSize: 22,
    lineHeight: 33,
  },
  highlight: {
    color: Colors.pink.pink50,
  },
  logo: {
    marginTop: 8,
    color: Colors.pink.pink50,
    fontFamily: FontFamily.bold,
    fontSize: 36,
    lineHeight: 37,
    letterSpacing: -1.1,
  },
  description: {
    marginTop: 14,
    color: '#777777',
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: 24,
  },
  footer: {
    marginTop: 'auto',
    gap: 8,
  },
  error: {
    color: Colors.pink.pink50,
    fontFamily: FontFamily.medium,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
});
