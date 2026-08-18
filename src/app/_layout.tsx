import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const [loaded] = useFonts({
    PretendardRegular: require('../../assets/fonts/Pretendard-Regular.otf'),
    PretendardMedium: require('../../assets/fonts/Pretendard-Medium.otf'),
    PretendardSemiBold: require('../../assets/fonts/Pretendard-SemiBold.otf'),
    PretendardBold: require('../../assets/fonts/Pretendard-Bold.otf'),
  });
  const colorScheme = useColorScheme();

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
