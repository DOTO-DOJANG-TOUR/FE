import LottieView from 'lottie-react-native';
import { StyleSheet, View } from 'react-native';

// 원본 로띠 파일 자체의 비율(70x14)을 유지한 채 크기만 조절한다.
const ASPECT_RATIO = 14 / 70;

type Props = {
  width?: number;
};

export function LoadingIndicator({ width = 70 }: Props) {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../../assets/lottie/loading.json')}
        autoPlay
        loop
        style={{ width, height: width * ASPECT_RATIO }}
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
