import TextLogo from '@/assets/images/festival/common/text-logo.png';
import { SearchIcon } from '@/components/icons/SearchIcon';
import { Image, StyleSheet, View } from 'react-native';

export default function FestivalMainHeader() {
  return (
    <View style={styles.container}>
      <Image
        source={TextLogo}
        style={styles.image}
        resizeMode="contain"
      />
      <SearchIcon />
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
});