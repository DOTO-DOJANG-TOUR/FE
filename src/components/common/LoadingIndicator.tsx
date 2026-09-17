import LottieView from 'lottie-react-native';
import { StyleSheet, View } from 'react-native';

// 원본 로띠 파일 자체의 비율(70x14)을 유지한 채 크기만 조절한다.
const ASPECT_RATIO = 14 / 70;

type Props = {
  width?: number;
};

export function LoadingIndicator({ width = 70 }: Props) {
  const height = width * ASPECT_RATIO;

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../../assets/lottie/loading.json')}
        autoPlay
        loop
        style={{ width, height }}
        // LottieView의 웹 구현(lottie-react-native/src/LottieView/index.web.tsx)은 style이 아니라
        // webStyle을 DOM에 적용한다. 둘 다 안 주면 웹에서 크기가 부모 100%로 늘어나 버린다.
        webStyle={{ width, height }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
