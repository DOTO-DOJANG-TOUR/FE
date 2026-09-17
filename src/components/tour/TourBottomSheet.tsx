import { CategoryBadge } from '@/components/common/CategoryBadge';
import { Colors, FontFamily, FontSize, Radius } from '@/constants/theme';
import { REQUIRED_STAMP_COUNT, TourColors, TourTypography } from '@/constants/tourTheme';
import { useTourMainSheet } from '@/hooks/use-tour-main-sheet';
import type { TourAttraction, TourFilterCategory } from '@/types/tour';
import { useState } from 'react';
import { TourAsset } from './TourAsset';
import { GestureDetector } from 'react-native-gesture-handler';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, { type SharedValue } from 'react-native-reanimated';
import { TourAttractionCard } from './TourAttractionCard';
import { TourStampIcon } from './TourIcons';

type Props = {
  expanded: boolean;
  title: string;
  stampCount: number | null;
  sharedHeight: SharedValue<number>;
  selectedCategory: TourFilterCategory;
  attractions: TourAttraction[];
  onExpandedChange: (expanded: boolean) => void;
  onCategoryChange: (category: TourFilterCategory) => void;
  onAttractionPress: (attraction: TourAttraction) => void;
};

const COLLAPSED_HEIGHT = 164;
const EXPANDED_HEIGHT = 510;
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
  sharedHeight,
}: Props) {
  const { height: screenHeight } = useWindowDimensions();
  const [headerHeight, setHeaderHeight] = useState(COLLAPSED_HEIGHT - 45);
  const collapsedHeight = Math.max(COLLAPSED_HEIGHT, headerHeight + 45);
  const expandedHeight = Math.max(collapsedHeight, Math.min(EXPANDED_HEIGHT, screenHeight - 180));
  const {
    animatedStyle,
    headerGesture,
    bodyGesture,
    nativeScrollGesture,
    onScroll,
  } = useTourMainSheet({
    expanded, collapsedHeight, expandedHeight, onExpandedChange, sharedHeight,
  });

  return (
    <Animated.View style={[styles.sheet, animatedStyle]}>
      <GestureDetector gesture={headerGesture}>
        <View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={expanded ? '관광지 목록 최소화' : '관광지 목록 최대화'}
            style={styles.handleArea}
            onPress={() => onExpandedChange(!expanded)}
          >
            <View style={styles.handle} />
          </Pressable>

          <View
            style={styles.header}
            onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}
          >
            <View style={styles.titleGroup}>
              <View style={styles.stampBadge}>
                <TourStampIcon />
                <Text style={styles.stampText}>{stampCount === null ? '—' : stampCount}/{REQUIRED_STAMP_COUNT}</Text>
              </View>
              <Text numberOfLines={2} style={styles.title}>
                {title}
              </Text>
            </View>
            <View style={styles.categoryRow}>
              {categories.map((category) => (
                <CategoryBadge
                  key={category}
                  category={category}
                  selected={selectedCategory === category}
                  onPress={() => onCategoryChange(category)}
                  style={styles.categoryBadge}
                />
              ))}
            </View>
          </View>
        </View>
      </GestureDetector>

      <GestureDetector gesture={bodyGesture}>
        <View style={styles.listArea}>
          {attractions.length > 0 ? (
            // 관광지 수가 많으면(이미지 포함) ScrollView는 전부 한 번에 마운트되어 시트
            // 높이 변경과 겹칠 때 버벅였다 — FlatList로 화면에 보이는 항목만 렌더링한다.
            <GestureDetector gesture={nativeScrollGesture}>
              <FlatList
                data={attractions}
                keyExtractor={(attraction) => attraction.id}
                showsVerticalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
                scrollEnabled={expanded}
                bounces={false}
                nestedScrollEnabled
                contentContainerStyle={styles.listContent}
                renderItem={({ item: attraction }) => (
                  <TourAttractionCard
                    attraction={attraction}
                    showCategory={selectedCategory === 'menu'}
                    onPress={() => onAttractionPress(attraction)}
                  />
                )}
              />
            </GestureDetector>
          ) : (
            <View style={styles.emptyContainer}>
              <TourAsset name="empty" />
              <Text style={styles.emptyText}>이 항목에 해당하는 관광지가 없어요.</Text>
            </View>
          )}
        </View>
      </GestureDetector>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: Colors.gray.gray00,
    boxShadow: TourColors.sheetShadow,
  },
  handleArea: {
    height: 35,
    paddingTop: 10,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 41,
    height: 5,
    borderRadius: Radius.full,
    backgroundColor: Colors.gray.gray30,
  },
  titleGroup: { gap: 8 },
  header: {
    gap: 18,
    paddingHorizontal: 20,
  },
  stampBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: Colors.pink.pink10,
  },
  stampText: {
    color: Colors.pink.pink50,
    fontSize: FontSize.xs,
    lineHeight: 18,
    includeFontPadding: false, fontFamily: FontFamily.semiBold,
  },
  title: {
    color: Colors.gray.gray100,
    fontSize: TourTypography.sheetTitle,
    lineHeight: TourTypography.sheetTitle * 1.5,
    includeFontPadding: false, fontFamily: FontFamily.semiBold,
  },
  categoryRow: {
    height: 34,
    flexDirection: 'row',
    gap: 7,
  },
  categoryBadge: {
    width: 'auto',
    flex: 1,
  },
  listArea: {
    flex: 1,
    marginTop: 20,
  },
  listContent: {
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 72,
  },
  emptyText: {
    marginTop: 4,
    color: Colors.gray.gray60,
    fontSize: FontSize.sm,
    includeFontPadding: false, fontFamily: FontFamily.regular,
  },
});
