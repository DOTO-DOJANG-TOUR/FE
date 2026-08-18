import { FontFamily, FontSize, Radius } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

type FestivalCategoryCode =
  | 'EV010100'
  | 'EV010200'
  | 'EV010300'
  | 'EV010400'
  | 'EV010500'
  | 'EV010600';

type Props = {
  category: FestivalCategoryCode;
};

const categoryLabel: Record<FestivalCategoryCode, string> = {
  EV010100: '문화관광',
  EV010200: '문화예술',
  EV010300: '지역특산물',
  EV010400: '전통역사',
  EV010500: '생태자연',
  EV010600: '기타',
};

export const FestivalCategoryBadge = ({ category }: Props) => {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{categoryLabel[category]}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    backgroundColor: '#F6F6F6',
  },
  text: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.5,
    fontFamily: FontFamily.medium,
    color: '#A8A8A8',
    textAlign: 'center',
  },
});
