import { Colors, FontFamily, FontSize } from '@/constants/theme';
import type { TourAttraction } from '@/types/tour';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TourImage } from './TourImage';
import { TourCategoryBadge } from './TourCategoryBadge';

type Props = {
  attraction: TourAttraction;
  onPress?: () => void;
  showCategory?: boolean;
};

export function TourAttractionCard({ attraction, onPress, showCategory = true }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${attraction.title} 상세 보기`}
      style={styles.card}
      onPress={onPress}
    >
      <TourImage uri={attraction.imageUrls[0]} style={styles.image} />
      <View style={styles.content}>
        <View>
          <Text numberOfLines={1} style={styles.title}>
            {attraction.title}
          </Text>
          <Text numberOfLines={2} style={styles.subtitle}>
            {attraction.distance ? `${attraction.distance} · ` : ''}
            {attraction.address}
          </Text>
        </View>
        {showCategory && <TourCategoryBadge category={attraction.category} />}
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
    gap: 8,
  },
  title: {
    color: Colors.gray.gray100,
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.5,
    includeFontPadding: false, fontFamily: FontFamily.semiBold,
  },
  subtitle: {
    color: Colors.gray.gray80,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    includeFontPadding: false, fontFamily: FontFamily.regular,
  },
});
