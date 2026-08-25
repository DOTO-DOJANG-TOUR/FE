import { Colors, FontFamily, FontSize, Radius } from '@/constants/theme';
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
  paddingHorizontal?: number;
  paddingVertical?: number;
  fontSize?: number;
  fontFamily?: string;
};

// 6개 코드 밖의 값(오타, 신규 카테고리 등)에 대한 폴백 없음 — API 연동 시점에 실제 응답 형태 보고 다시 결정하기로 함(2026-08-18)
const categoryLabel: Record<FestivalCategoryCode, string> = {
  EV010100: '문화관광',
  EV010200: '문화예술',
  EV010300: '지역특산물',
  EV010400: '전통역사',
  EV010500: '생태자연',
  EV010600: '기타',
};

export const FestivalCategoryBadge = ({
  category,
  paddingHorizontal = 8,
  paddingVertical = 2,
  fontSize = FontSize.xs,
  fontFamily = FontFamily.medium,
}: Props) => {
  return (
    <View style={[
      styles.badge, {
        paddingHorizontal,
        paddingVertical,
      }]}>
      <Text style={[
        styles.text,
        {
          fontSize,
          fontFamily,
        }]}>{categoryLabel[category]}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
    backgroundColor: Colors.gray.gray20,
  },
  text: {
    color: Colors.gray.gray70,
    textAlign: 'center',
  },
});
