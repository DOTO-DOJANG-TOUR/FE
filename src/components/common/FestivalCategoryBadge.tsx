import { Colors, FontFamily, FontSize, Radius } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

// 백엔드가 lclsSystem3 코드가 아니라 '문화관광' 같은 카테고리명을 그대로 내려주므로 변환 없이 표시한다
type Props = {
  category: string;
  paddingHorizontal?: number;
  paddingVertical?: number;
  fontSize?: number;
  fontFamily?: string;
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
        }]}>{category}</Text>
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
