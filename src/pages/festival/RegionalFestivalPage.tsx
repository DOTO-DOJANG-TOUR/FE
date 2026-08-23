import RegionalHeader from '@/components/festival/region/RegionalHeader';
import { Colors } from '@/constants/theme';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  subtitle: string;
  title: string;
}

export const RegionalFestivalPage = ({
  subtitle,
  title,
}: Props) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
        },
      ]}
    >
      <RegionalHeader subtitle={subtitle} title={title} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray.gray00,
  },
});