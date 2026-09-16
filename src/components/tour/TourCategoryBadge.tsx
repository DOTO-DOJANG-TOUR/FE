import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import type { TourCategory } from '@/types/tour';
import { StyleSheet, Text, View } from 'react-native';

const labels: Record<TourCategory, string> = {
  culture: '문화관광', history: '역사관광', nature: '자연관광', experience: '체험관광',
};

export function TourCategoryBadge({ category }: { category: TourCategory }) {
  return <View style={styles.badge}><Text style={styles.label}>{labels[category]}</Text></View>;
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', paddingHorizontal: Spacing.two, paddingVertical: Spacing.half,
    borderRadius: Radius.sm, backgroundColor: Colors.gray.gray20 },
  label: { includeFontPadding: false, fontFamily: FontFamily.medium, fontSize: FontSize.xs, lineHeight: 18, color: Colors.gray.gray70 },
});
