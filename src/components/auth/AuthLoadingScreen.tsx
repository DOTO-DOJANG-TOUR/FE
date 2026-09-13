import { Colors, FontFamily, FontSize } from '@/constants/theme';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function AuthLoadingScreen() {
  const { height: windowHeight } = useWindowDimensions();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={[
          styles.screen,
          Platform.OS === 'web' && { height: Math.min(windowHeight, 852) },
        ]}
      >
        <View style={styles.center}>
          <Text style={styles.logo}>DOTO</Text>
          <Text style={styles.tagline}>축제 관광을 도장 투어로</Text>
        </View>
        <ActivityIndicator style={styles.indicator} color={Colors.pink.pink40} />
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
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: 393,
    backgroundColor: Colors.gray.gray00,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 24px rgba(38, 38, 38, 0.10)',
      },
      default: {},
    }),
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    color: Colors.pink.pink50,
    fontFamily: FontFamily.bold,
    fontSize: 37,
    lineHeight: 44,
    letterSpacing: -1.1,
  },
  tagline: {
    marginTop: 10,
    color: Colors.gray.gray100,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    lineHeight: 21,
  },
  indicator: {
    position: 'absolute',
    bottom: 42,
    alignSelf: 'center',
  },
});
