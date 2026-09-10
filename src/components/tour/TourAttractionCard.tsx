import { CategoryBadge } from '@/components/common/CategoryBadge';
import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';
import type { TourAttraction } from '@/types/tour';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CheckerPlaceholder } from './CheckerPlaceholder';

type Props = {
  attraction: TourAttraction;
  onPress: () => void;
};

export function TourAttractionCard({ attraction, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${attraction.title} 상세 보기`}
      style={styles.card}
      onPress={onPress}
    >
      <CheckerPlaceholder columns={4} rows={4} rounded style={styles.image} />
      <View style={styles.content}>
        <View>
          <Text numberOfLines={1} style={styles.title}>
            {attraction.title}
          </Text>
          <Text numberOfLines={1} style={styles.subtitle}>
            {attraction.distance} · {attraction.address}
          </Text>
        </View>
        <CategoryBadge category={attraction.category} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },
  image: {
    width: 140,
    height: 140,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  title: {
    color: Colors.gray.gray100,
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.5,
    fontFamily: FontFamily.semiBold,
  },
  subtitle: {
    marginTop: Spacing.one,
    color: Colors.gray.gray100,
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.5,
    fontFamily: FontFamily.regular,
  },
});
