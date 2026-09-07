import { CategoryBadge } from '@/components/common/CategoryBadge';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { TourColors } from '@/constants/tourTheme';
import type { TourAttraction, TourFilterCategory } from '@/types/tour';
import { useEffect, useMemo, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TourAttractionCard } from './TourAttractionCard';
import { TourStampIcon } from './TourIcons';

type Props = {
  expanded: boolean;
  title: string;
  stampCount: number;
  selectedCategory: TourFilterCategory;
  attractions: TourAttraction[];
  onExpandedChange: (expanded: boolean) => void;
  onCategoryChange: (category: TourFilterCategory) => void;
  onAttractionPress: (attraction: TourAttraction) => void;
};

const COLLAPSED_HEIGHT = 168;
const EXPANDED_HEIGHT = 536;
const categories: TourFilterCategory[] = [
  'menu',
  'culture',
  'history',
  'nature',
  'experience',
];

export function TourBottomSheet({
  expanded,
  title,
  stampCount,
  selectedCategory,
  attractions,
  onExpandedChange,
  onCategoryChange,
  onAttractionPress,
}: Props) {
  const [height] = useState(() => new Animated.Value(COLLAPSED_HEIGHT));

  useEffect(() => {
    Animated.spring(height, {
      toValue: expanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT,
      damping: 24,
      stiffness: 220,
      mass: 0.8,
      useNativeDriver: false,
    }).start();
  }, [expanded, height]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 8,
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy < -24) onExpandedChange(true);
          if (gesture.dy > 24) onExpandedChange(false);
        },
      }),
    [onExpandedChange],
  );

  return (
    <Animated.View style={[styles.sheet, { height }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={expanded ? '관광지 목록 최소화' : '관광지 목록 최대화'}
        style={styles.handleArea}
        onPress={() => onExpandedChange(!expanded)}
        {...panResponder.panHandlers}
      >
        <View style={styles.handle} />
      </Pressable>

      <View style={styles.header}>
        <View style={styles.stampBadge}>
          <TourStampIcon />
          <Text style={styles.stampText}>{stampCount}/3</Text>
        </View>
        <Text numberOfLines={2} style={styles.title}>
          {title}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {categories.map((category) => (
            <CategoryBadge
              key={category}
              category={category}
              selected={selectedCategory === category}
              onPress={() => onCategoryChange(category)}
            />
          ))}
        </ScrollView>
      </View>

      {expanded && (
        <View style={styles.listArea}>
          {attractions.length > 0 ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            >
              {attractions.map((attraction) => (
                <TourAttractionCard
                  key={attraction.id}
                  attraction={attraction}
                  onPress={() => onAttractionPress(attraction)}
                />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyIconText}>×</Text>
              </View>
              <Text style={styles.emptyText}>이 항목에 해당하는 관광지가 없어요.</Text>
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );
}

export const TOUR_SHEET_HEIGHT = {
  collapsed: COLLAPSED_HEIGHT,
  expanded: EXPANDED_HEIGHT,
} as const;

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: Colors.gray.gray00,
    boxShadow: '0 -2px 10px rgba(38, 38, 38, 0.06)',
  },
  handleArea: {
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: TourColors.gray40,
  },
  header: {
    gap: 10,
    paddingHorizontal: 20,
  },
  stampBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: Colors.pink.pink10,
  },
  stampText: {
    color: Colors.pink.pink40,
    fontSize: FontSize.xs,
    fontFamily: FontFamily.semiBold,
  },
  title: {
    color: Colors.gray.gray100,
    fontSize: 18,
    lineHeight: 27,
    fontFamily: FontFamily.semiBold,
  },
  categoryRow: {
    gap: 6,
    paddingBottom: 2,
  },
  listArea: {
    flex: 1,
    marginTop: Spacing.three,
  },
  listContent: {
    gap: 14,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 72,
  },
  emptyIcon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: TourColors.gray50,
    borderRadius: Radius.full,
  },
  emptyIconText: {
    color: TourColors.gray50,
    fontSize: 12,
    lineHeight: 14,
  },
  emptyText: {
    color: Colors.gray.gray60,
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
  },
});
