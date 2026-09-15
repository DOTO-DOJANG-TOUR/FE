import { DotoLogoIcon } from '@/components/icons';
import { FontFamily, FontSize, Colors } from '@/constants/theme';
import {
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
          <DotoLogoIcon width={127} height={37} />
          <Text style={styles.tagline}>
            축제 관광을 <Text style={styles.taglineHighlight}>도장 투어</Text>로
          </Text>
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
  tagline: {
    marginTop: 10,
    color: Colors.pink.pink50,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 21,
  },
  taglineHighlight: {
    fontFamily: FontFamily.semiBold,
  },
});
