import { Colors, FontFamily, FontSize } from '@/constants/theme';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  onRetry: () => void;
};

// #48 OPEN_QUESTIONS B-3: 앱 시작 시 활성 방문 조회가 실패하면 일반 화면을 열지 않고
// 재시도로 막는다 — 화면 잠금 판단 전에 다른 관광지 방문을 시작할 수 있는 상황을 피하기 위함.
export function TourVisitRestoreErrorScreen({ onRetry }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.center}>
        <Text style={styles.title}>방문 정보를 불러오지 못했어요.</Text>
        <Text style={styles.description}>잠시 후 다시 시도해 주세요.</Text>
        <Pressable style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>다시 시도</Text>
        </Pressable>
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
  center: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: Colors.gray.gray100,
    fontSize: FontSize.md,
    fontFamily: FontFamily.semiBold,
    textAlign: 'center',
  },
  description: {
    marginTop: 8,
    color: Colors.gray.gray70,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.pink.pink40,
  },
  buttonText: {
    color: Colors.gray.gray00,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.semiBold,
  },
});
