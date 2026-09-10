import { AlertModal } from '@/components/common/AlertModal';
import { DojangTourButton } from '@/components/common/DojangTourButton';
import { LocationIcon } from '@/components/icons/LocationIcon';
import { PhoneIcon } from '@/components/icons/PhoneIcon';
import { WebIcon } from '@/components/icons/WebIcon';
import { Colors, FontFamily, FontSize, Radius } from '@/constants/theme';
import { TourColors, TourTypography } from '@/constants/tourTheme';
import type { TourAttraction } from '@/types/tour';
import { useEffect, useMemo, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { CheckerPlaceholder } from './CheckerPlaceholder';
import { CloseIcon } from './TourIcons';

type Props = {
  attraction: TourAttraction;
  expanded: boolean;
  visited: boolean;
  onClose: () => void;
  onExpandedChange: (expanded: boolean) => void;
  onVisited: () => void;
};

const COLLAPSED_HEIGHT = 184;

export function TourDetailBottomSheet({
  attraction,
  expanded,
  visited,
  onClose,
  onExpandedChange,
  onVisited,
}: Props) {
  const { height: screenHeight } = useWindowDimensions();
  const expandedHeight = Math.max(
    COLLAPSED_HEIGHT,
    Math.min(600, screenHeight - 196),
  );
  const [height] = useState(() => new Animated.Value(expandedHeight));
  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => {
    Animated.spring(height, {
      toValue: expanded ? expandedHeight : COLLAPSED_HEIGHT,
      damping: 24,
      stiffness: 220,
      mass: 0.8,
      useNativeDriver: false,
    }).start();
  }, [expanded, expandedHeight, height]);

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

  const handleVisit = () => {
    setConfirmVisible(false);
    onVisited();
  };

  return (
    <>
      <Animated.View style={[styles.sheet, { height }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={expanded ? '관광지 상세 최소화' : '관광지 상세 최대화'}
          style={styles.handleArea}
          onPress={() => onExpandedChange(!expanded)}
          {...panResponder.panHandlers}
        >
          <View style={styles.handle} />
        </Pressable>

        <View style={styles.titleRow}>
          <Text numberOfLines={2} style={styles.title}>
            {attraction.title}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="관광지 상세 닫기"
            hitSlop={10}
            onPress={onClose}
          >
            <CloseIcon />
          </Pressable>
        </View>

        {expanded && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photoRow}
            >
              {Array.from({ length: attraction.imageCount }).map((_, index) => (
                <CheckerPlaceholder
                  key={`${attraction.id}-${index}`}
                  columns={4}
                  rows={4}
                  rounded
                  style={styles.photo}
                />
              ))}
            </ScrollView>

            <View style={styles.infoGroup}>
              <InfoRow icon={<LocationIcon />} text={attraction.address} />
              <InfoRow icon={<PhoneIcon />} text={attraction.phone} />
              <InfoRow icon={<WebIcon />} text={attraction.homepage} isLink />
            </View>
          </ScrollView>
        )}

        <View style={styles.buttonArea}>
          <DojangTourButton
            status={visited ? 'alreadyVisited' : 'visitAndStamp'}
            onPress={() => setConfirmVisible(true)}
          />
        </View>
      </Animated.View>

      <AlertModal
        visible={confirmVisible}
        title="이 관광지를 방문할까요?"
        description={'7시간 이내에 도착하면\n도장을 획득합니다.'}
        cancelText="취소"
        confirmText="방문"
        confirmTextColor={Colors.pink.pink50}
        onClose={() => setConfirmVisible(false)}
        onConfirm={handleVisit}
      />
    </>
  );
}

type InfoRowProps = {
  icon: React.ReactNode;
  text: string;
  isLink?: boolean;
};

function InfoRow({ icon, text, isLink = false }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>{icon}</View>
      <Text style={[styles.infoText, isLink && styles.linkText]}>{text}</Text>
    </View>
  );
}

export const TOUR_DETAIL_SHEET_HEIGHT = {
  collapsed: COLLAPSED_HEIGHT,
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
    boxShadow: TourColors.sheetShadow,
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
  titleRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    paddingHorizontal: 20,
  },
  title: {
    flex: 1,
    color: Colors.gray.gray100,
    fontSize: TourTypography.title,
    lineHeight: TourTypography.title * 1.5,
    fontFamily: FontFamily.semiBold,
  },
  content: {
    paddingTop: 10,
    paddingBottom: 92,
  },
  photoRow: {
    gap: 8,
    paddingHorizontal: 20,
  },
  photo: {
    width: 116,
    height: 116,
  },
  infoGroup: {
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  infoRow: {
    minHeight: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoIcon: {
    width: 20,
    alignItems: 'center',
    paddingTop: 1,
  },
  infoText: {
    flex: 1,
    color: Colors.gray.gray100,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    fontFamily: FontFamily.regular,
  },
  linkText: {
    color: TourColors.link,
    textDecorationLine: 'underline',
  },
  buttonArea: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: Colors.gray.gray00,
    boxShadow: TourColors.buttonAreaShadow,
  },
});
