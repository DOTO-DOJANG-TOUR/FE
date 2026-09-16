import { AlertModal } from '@/components/common/AlertModal';
import { DojangTourButton } from '@/components/common/DojangTourButton';
import { Colors, FontFamily, FontSize, Radius } from '@/constants/theme';
import { TourColors, TourTypography } from '@/constants/tourTheme';
import { useTourSheet } from '@/hooks/use-tour-sheet';
import type { TourAttraction } from '@/types/tour';
import { useState } from 'react';
import { Animated, Linking, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TourAsset } from './TourAsset';
import { TourImage } from './TourImage';
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

type Props = {
  attraction: TourAttraction; expanded: boolean; visited: boolean;
  onClose: () => void; onExpandedChange: (expanded: boolean) => void;
  onVisited: () => void; onRequestVisit: () => Promise<boolean>;
};

const COLLAPSED_HEIGHT = 184;

export function TourDetailBottomSheet({ attraction, expanded, visited, onClose, onExpandedChange,
  onVisited, onRequestVisit }: Props) {
  const { height: screenHeight, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [bodyHeight, setBodyHeight] = useState(214);
  const [titleHeight, setTitleHeight] = useState(33);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(false);
  const [linkError, setLinkError] = useState(false);
  const bottomPadding = Math.max(40, insets.bottom + 14);
  const buttonHeight = 14 + 54 + bottomPadding;
  const collapsedHeight = 35 + titleHeight + 10 + buttonHeight;
  const expandedHeight = Math.max(collapsedHeight, Math.min(
    collapsedHeight + bodyHeight + 20, screenHeight - insets.top - 120,
  ));
  const { height, headerPanHandlers, bodyGesture, nativeScrollGesture, onScroll } = useTourSheet({
    expanded, collapsedHeight, expandedHeight, onExpandedChange,
  });
  const photos = attraction.imageUrls.filter((uri) => uri?.trim());
  const openLink = async (url: string) => {
    try { await Linking.openURL(url); } catch { setLinkError(true); }
  };

  return <>
    <GestureHandlerRootView style={styles.gestureRoot} pointerEvents="box-none">
    <Animated.View style={[styles.sheet, { height }]}>
      <View {...headerPanHandlers}>
        <Pressable accessibilityRole="button" accessibilityLabel={expanded ? '관광지 상세 최소화' : '관광지 상세 최대화'}
          style={styles.handleArea} onPress={() => onExpandedChange(!expanded)}>
          <View style={styles.handle} />
        </Pressable>
        <View style={styles.titleRow} onLayout={(event) => setTitleHeight(event.nativeEvent.layout.height)}>
          <Text numberOfLines={2} style={styles.title}>{attraction.title}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="관광지 상세 닫기" hitSlop={10} onPress={onClose}>
            <TourAsset name="close" />
          </Pressable>
        </View>
      </View>
      <GestureDetector gesture={bodyGesture}><View style={[styles.scroll, { opacity: expanded ? 1 : 0 }]}
        pointerEvents={expanded ? 'auto' : 'none'}>
      <GestureDetector gesture={nativeScrollGesture}><ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} onScroll={onScroll}
        scrollEventThrottle={16} nestedScrollEnabled bounces={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.content} onLayout={(event) => setBodyHeight(event.nativeEvent.layout.height)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
            {(photos.length ? photos : ['']).map((uri, index) => <TourImage key={`${attraction.id}-${index}`}
              uri={uri} style={{ width: (width - 40 - 21) / 4, height: 80 }} />)}
          </ScrollView>
          <View style={styles.infoGroup}>
            <InfoRow icon="space" text={attraction.address} />
            {!!attraction.phone?.trim() && <InfoRow icon="call" text={attraction.phone}
              onPress={() => openLink(`tel:${attraction.phone}`)} />}
            {!!attraction.homepage?.trim() && <InfoRow icon="page" text="홈페이지 바로가기" isLink
              onPress={() => openLink(attraction.homepage!)} />}
          </View>
        </View>
      </ScrollView></GestureDetector></View></GestureDetector>
      <View style={[styles.buttonArea, { paddingBottom: bottomPadding }]}>
        <DojangTourButton status={visited ? 'alreadyVisited' : 'visitAndStamp'}
          onPress={checkingPermission || visited ? undefined : async () => {
            setCheckingPermission(true);
            try { if (await onRequestVisit()) setConfirmVisible(true); }
            finally { setCheckingPermission(false); }
          }} />
      </View>
    </Animated.View>
    </GestureHandlerRootView>
    <AlertModal visible={confirmVisible} title="이 관광지를 방문할까요?"
      description="7시간 이내에 도착하면 도장을 획득합니다." singleLineDescription
      cancelText="취소" confirmText="방문" confirmTextColor={Colors.pink.pink50}
      onClose={() => setConfirmVisible(false)} onConfirm={() => { setConfirmVisible(false); onVisited(); }} />
    <AlertModal visible={linkError} title="연결할 수 없어요" description="연결할 앱과 주소를 확인해 주세요."
      confirmText="확인" onClose={() => setLinkError(false)} onConfirm={() => setLinkError(false)} />
  </>;
}

function InfoRow({ icon, text, isLink, onPress }: {
  icon: 'space' | 'call' | 'page'; text: string; isLink?: boolean; onPress?: () => void;
}) {
  const row = <View style={styles.infoRow}><TourAsset name={icon} />
    <Text style={[styles.infoText, isLink && styles.linkText]}>{text}</Text></View>;
  return onPress ? <Pressable accessibilityRole="link" onPress={onPress}>{row}</Pressable> : row;
}

export const TOUR_DETAIL_SHEET_HEIGHT = { collapsed: COLLAPSED_HEIGHT } as const;
const styles = StyleSheet.create({
  gestureRoot: { ...StyleSheet.absoluteFill },
  sheet: { position: 'absolute', right: 0, bottom: 0, left: 0, overflow: 'hidden',
    borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: Colors.gray.gray00,
    boxShadow: TourColors.sheetShadow },
  handleArea: { height: 35, paddingTop: 10, paddingBottom: 20, alignItems: 'center', justifyContent: 'center' },
  handle: { width: 41, height: 5, borderRadius: Radius.full, backgroundColor: Colors.gray.gray30 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, paddingHorizontal: 20 },
  title: { flex: 1, color: Colors.gray.gray90, fontSize: TourTypography.sheetTitle,
    lineHeight: 33, includeFontPadding: false, fontFamily: FontFamily.semiBold },
  scroll: { flex: 1, minHeight: 0 },
  scrollContent: { paddingTop: 20, paddingBottom: 10 },
  content: { gap: 20 },
  photoRow: { gap: 7, paddingHorizontal: 20 },
  infoGroup: { gap: 8, paddingHorizontal: 20 },
  infoRow: { minHeight: 26, flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { flex: 1, color: Colors.gray.gray100, fontSize: FontSize.sm, lineHeight: 21,
    includeFontPadding: false, fontFamily: FontFamily.medium },
  linkText: { textDecorationLine: 'underline' },
  buttonArea: { paddingHorizontal: 20, paddingTop: 14, backgroundColor: Colors.gray.gray00,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' },
});
