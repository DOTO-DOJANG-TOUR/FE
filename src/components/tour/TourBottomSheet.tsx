import { CategoryBadge } from '@/components/common/CategoryBadge';
import { Colors, FontFamily, FontSize, Radius } from '@/constants/theme';
import { REQUIRED_STAMP_COUNT, TourColors, TourTypography } from '@/constants/tourTheme';
import type { TourAttraction, TourFilterCategory } from '@/types/tour';
import { useEffect, useState } from 'react';
import { useTourSheet } from '@/hooks/use-tour-sheet';
import { TourAsset } from './TourAsset';
import { GestureDetector } from 'react-native-gesture-handler';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { TourAttractionCard } from './TourAttractionCard';
import { TourStampIcon } from './TourIcons';

type Props = {
  expanded: boolean;
  title: string;
  stampCount: number | null;
  onHeightChange?: (height: number) => void;
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
  onHeightChange,
}: Props) {
  const { height: screenHeight } = useWindowDimensions();
  const [headerHeight, setHeaderHeight] = useState(COLLAPSED_HEIGHT - 45);
  const collapsedHeight = Math.max(COLLAPSED_HEIGHT, headerHeight + 45);
  const expandedHeight = Math.max(collapsedHeight, Math.min(EXPANDED_HEIGHT, screenHeight - 180));
  const { height, headerPanHandlers, bodyGesture, nativeScrollGesture, onScroll } = useTourSheet({
    expanded, collapsedHeight, expandedHeight, onExpandedChange,
  });

  // 애니메이션 중 onLayout 높이를 매 프레임 부모로 올리면 지도 위 버튼까지 계속 재배치된다.
  // 시트가 향하는 스냅 높이만 알려서 지도와 시트가 서로의 레이아웃을 흔들지 않게 한다.
  useEffect(() => {
    onHeightChange?.(expanded ? expandedHeight : collapsedHeight);
  }, [expanded, collapsedHeight, expandedHeight, onHeightChange]);

  return (
    <Animated.View style={[styles.sheet, { height }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={expanded ? '관광지 목록 최소화' : '관광지 목록 최대화'}
        style={styles.handleArea}
        onPress={() => onExpandedChange(!expanded)}
        {...headerPanHandlers}
      >
        <View style={styles.handle} />
      </Pressable>

      <View style={styles.header} {...headerPanHandlers}
        onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}>
        <View style={styles.titleGroup}>
        <View style={styles.stampBadge}>
          <TourStampIcon />
          <Text style={styles.stampText}>{stampCount === null ? '—' : stampCount}/{REQUIRED_STAMP_COUNT}</Text>
        </View>
        <Text numberOfLines={2} style={styles.title}>
          {title}
        </Text>
        </View>
        <ScrollView
          style={styles.filters}
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

      {(
        <GestureDetector gesture={bodyGesture}><View style={styles.listArea}>
          {attractions.length > 0 ? (
            <GestureDetector gesture={nativeScrollGesture}><ScrollView
              showsVerticalScrollIndicator={false}
              onScroll={onScroll}
              scrollEventThrottle={16}
              bounces={false}
              nestedScrollEnabled
              contentContainerStyle={styles.listContent}
            >
              {attractions.map((attraction) => (
                <TourAttractionCard
                  key={attraction.id}
                  attraction={attraction}
                  showCategory={selectedCategory === 'menu'}
                  onPress={() => onAttractionPress(attraction)}
                />
              ))}
            </ScrollView></GestureDetector>
          ) : (
            <View style={styles.emptyContainer}>
              <TourAsset name="empty" />
              <Text style={styles.emptyText}>이 항목에 해당하는 관광지가 없어요.</Text>
            </View>
          )}
        </View></GestureDetector>
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
  filters: { height: 34, flexGrow: 0 },
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
    gap: 7,
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
