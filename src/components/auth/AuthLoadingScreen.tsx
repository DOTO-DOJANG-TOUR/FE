import { Colors, FontFamily, FontSize } from '@/constants/theme';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function AuthLoadingScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.center}>
        <Text style={styles.logo}>DOTO</Text>
        <Text style={styles.tagline}>축제 관광을 도장 투어로</Text>
      </View>
      <ActivityIndicator style={styles.indicator} color={Colors.pink.pink40} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.gray.gray00,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    // 로고용 타이포 크기는 본문 폰트 스케일과 달라 Figma 수치를 그대로 사용한다.
    color: Colors.pink.pink50,
    fontFamily: FontFamily.bold,
    fontSize: 46,
    lineHeight: 56,
    letterSpacing: -1.2,
  },
  tagline: {
    marginTop: 4,
    color: Colors.gray.gray100,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  indicator: {
    position: 'absolute',
    bottom: 42,
    alignSelf: 'center',
  },
});
