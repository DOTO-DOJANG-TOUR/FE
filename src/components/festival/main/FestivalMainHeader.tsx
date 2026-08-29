import TextLogo from '@/assets/images/festival/common/text-logo.png';
import { SearchIcon } from '@/components/icons/SearchIcon';
import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, View } from 'react-native';

export default function FestivalMainHeader() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={TextLogo}
        style={styles.image}
        resizeMode="contain"
      />
      <Pressable
        style={styles.searchButton}
        onPress={() => router.push('/search/festival')}
      >
        <SearchIcon />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: 55,
    height: 16,
  },
  searchButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  }
});