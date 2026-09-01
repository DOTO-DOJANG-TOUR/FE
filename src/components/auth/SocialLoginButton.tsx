import { GoogleIcon, KakaoIcon } from '@/components/icons';
import { Colors, FontFamily, FontSize, Radius } from '@/constants/theme';
import type { SocialProvider } from '@/types/auth';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  provider: SocialProvider;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

const labels: Record<SocialProvider, string> = {
  GOOGLE: 'Google로 계속하기',
  KAKAO: '카카오로 계속하기',
};

export function SocialLoginButton({ provider, loading = false, disabled = false, onPress }: Props) {
  const isKakao = provider === 'KAKAO';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={labels[provider]}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isKakao ? styles.kakaoButton : styles.googleButton,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
      ]}
    >
      <View style={styles.icon}>{isKakao ? <KakaoIcon /> : <GoogleIcon />}</View>
      {loading ? (
        <ActivityIndicator color={Colors.gray.gray100} />
      ) : (
        <Text style={styles.label}>{labels[provider]}</Text>
      )}
      <View style={styles.icon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: Radius.md,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  googleButton: {
    backgroundColor: Colors.gray.gray00,
    borderWidth: 1,
    borderColor: Colors.gray.gray20,
  },
  kakaoButton: {
    // Kakao 공식 로그인 버튼 브랜드 컬러라 DOTO 테마 토큰으로 치환하지 않는다.
    backgroundColor: '#FEE500',
  },
  icon: {
    width: 22,
    alignItems: 'center',
  },
  label: {
    color: Colors.gray.gray100,
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.md,
    lineHeight: 24,
  },
  pressed: {
    opacity: 0.78,
  },
  disabled: {
    opacity: 0.55,
  },
});
