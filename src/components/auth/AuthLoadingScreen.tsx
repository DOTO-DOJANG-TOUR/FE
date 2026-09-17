import { DotoLogoIcon } from '@/components/icons';
import { Colors, FontFamily, FontSize } from '@/constants/theme';
import {
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function AuthLoadingScreen({ onLayout }: { onLayout?: () => void }) {
  const { height: windowHeight } = useWindowDimensions();

  return (
    <SafeAreaView style={styles.safeArea} onLayout={onLayout}>
      <View
        style={[
          styles.screen,
          Platform.OS === 'web' && { height: Math.min(windowHeight, 852) },
        ]}
      >
        <View style={styles.center}>
          <DotoLogoIcon width={127} height={37} />
          <View style={styles.taglineRow}>
            <Text style={styles.tagline}>축제 관광을 </Text>
            <Text style={styles.taglineHighlight}>도장 투어</Text>
            <Text style={styles.tagline}>로</Text>
          </View>
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
  taglineRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagline: {
    color: Colors.pink.pink50,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: 21,
  },
  taglineHighlight: {
    color: Colors.pink.pink50,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    lineHeight: 21,
  },
});