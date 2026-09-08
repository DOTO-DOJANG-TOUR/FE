import { signInWithSocialToken } from '@/apis/auth';
import { SocialLoginButton } from '@/components/auth/SocialLoginButton';
import { DotoBrandIcon } from '@/components/icons';
import { Colors, FontFamily, FontSize } from '@/constants/theme';
import { requestSocialIdToken } from '@/services/socialOAuth';
import { useAuthStore } from '@/stores/authStore';
import type { SocialProvider } from '@/types/auth';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
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
      <View style={styles.container}>
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
    backgroundColor: Colors.gray.gray00,
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 393,
    alignSelf: 'center',
    paddingHorizontal: 25,
    paddingBottom: 18,
  },
  hero: {
    marginTop: 100,
    alignItems: 'flex-start',
  },
  title: {
    marginTop: 18,
    color: Colors.gray.gray100,
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xl,
    lineHeight: 34,
    letterSpacing: -0.6,
  },
  highlight: {
    color: Colors.pink.pink50,
  },
  logo: {
    // 로고용 타이포 크기는 본문 폰트 스케일과 달라 Figma 수치를 그대로 사용한다.
    marginTop: 4,
    color: Colors.gray.gray100,
    fontFamily: FontFamily.bold,
    fontSize: 50,
    lineHeight: 60,
    letterSpacing: -1.5,
  },
  description: {
    marginTop: 8,
    color: Colors.gray.gray70,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    lineHeight: 24,
  },
  footer: {
    marginTop: 'auto',
    gap: 12,
  },
  error: {
    color: Colors.pink.pink50,
    fontFamily: FontFamily.medium,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
});
