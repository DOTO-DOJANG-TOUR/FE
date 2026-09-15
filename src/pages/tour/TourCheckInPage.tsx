import { ApiError } from '@/apis/client';
import { createTourSpotStamp, stopTourSpotVisit } from '@/apis/tourVisit';
import { AlertModal } from '@/components/common/AlertModal';
import { DojangTourButton } from '@/components/common/DojangTourButton';
import { ErrorModal } from '@/components/common/ErrorModal';
import {
  CloseIcon,
  VisitCheckIcon,
  VisitLocationIcon,
  VisitPinIcon,
  VisitPinShadowIcon,
} from '@/components/tour/TourIcons';
import { Colors, FontFamily } from '@/constants/theme';
import { useCurrentLocation } from '@/hooks/use-current-location';
import { useTourVisitStore } from '@/stores/tourVisitStore';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// #41(stamp-detail) 머지 전까지 임시로 비활성화. 머지 후 true로 바꾸고 라우트를 연결한다.
const STAMP_DETAIL_ROUTE_AVAILABLE = false;

function formatCountdown(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export default function TourCheckInPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { requestLocation } = useCurrentLocation();

  const status = useTourVisitStore((state) => state.status);
  const festivalId = useTourVisitStore((state) => state.festivalId);
  const tourSpotId = useTourVisitStore((state) => state.tourSpotId);
  const tourSpotName = useTourVisitStore((state) => state.tourSpotName);
  const expiresAt = useTourVisitStore((state) => state.expiresAt);
  const restore = useTourVisitStore((state) => state.restore);

  const [remainingMs, setRemainingMs] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [completionRestoring, setCompletionRestoring] = useState(false);
  const completionRestorePromiseRef = useRef<Promise<void> | null>(null);
  const [exitConfirmVisible, setExitConfirmVisible] = useState(false);
  const [tooFarVisible, setTooFarVisible] = useState(false);
  const [locationDeniedVisible, setLocationDeniedVisible] = useState(false);
  const [locationUnavailableVisible, setLocationUnavailableVisible] = useState(false);
  const [retryVisible, setRetryVisible] = useState(false);

  const navigateBack = () => {
    // 딥링크·화면 잠금 해제 직후에는 canGoBack()이 true여도 실제 back stack이 없어
    // GO_BACK 경고가 날 수 있다. 체크인 종료 지점은 항상 투어 메인으로 명시 이동한다.
    router.replace('/(tabs)/tour');
  };

  const handleCompletedClose = async () => {
    await completionRestorePromiseRef.current;
    router.replace('/(tabs)/tour');
  };

  // 서버가 내려준 expiresAt 기준으로 매초 다시 계산한다(로컬에서 7시간을 새로 세지 않음).
  useEffect(() => {
    if (!expiresAt || completed) return;

    const tick = () => {
      const remaining = new Date(expiresAt).getTime() - Date.now();
      setRemainingMs(remaining);
      if (remaining <= 0) {
        void restore();
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, completed, restore]);

  // 취소·만료 등으로 다른 곳에서 활성 방문이 종료되면 화면 잠금이 풀리므로 이 화면도 빠져나간다.
  // 도장 획득 완료 화면은 예외 — 사용자가 닫기/도장 확인을 누를 때까지 유지한다.
  useEffect(() => {
    if (completed || completionRestoring) return;
    if (status === 'idle') navigateBack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, completed, completionRestoring]);

  const handleArrival = async () => {
    if (!festivalId || !tourSpotId) {
      setRetryVisible(true);
      return;
    }

    setSubmitting(true);
    try {
      const result = await requestLocation();
      if (!result.coords) {
        if (result.permission === 'denied') {
          setLocationDeniedVisible(true);
        } else {
          // 권한은 있지만 GPS가 좌표를 주지 못한 경우다. 서버 요청 실패가 아니므로
          // 일반 "일시적인 오류"와 구분해 위치 서비스를 확인하도록 안내한다.
          setLocationUnavailableVisible(true);
        }
        return;
      }

      await createTourSpotStamp(festivalId, tourSpotId, {
        mapX: result.coords.lng,
        mapY: result.coords.lat,
      });
      setCompleted(true);
      setCompletionRestoring(true);
      const completionRestorePromise = restore().finally(() => {
        setCompletionRestoring(false);
        completionRestorePromiseRef.current = null;
      });
      completionRestorePromiseRef.current = completionRestorePromise;
      void completionRestorePromise;
    } catch (error) {
      if (error instanceof ApiError && error.code === 'STAMP-400-001') {
        setTooFarVisible(true);
        return;
      }
      setRetryVisible(true);
    } finally {
      // 위치 권한 요청 자체가 예외를 던져도 버튼이 영구 비활성화되지 않게 한다.
      setSubmitting(false);
    }
  };

  const handleStopVisit = async () => {
    setExitConfirmVisible(false);

    if (festivalId && tourSpotId) {
      try {
        await stopTourSpotVisit(festivalId, tourSpotId);
      } catch {
        setRetryVisible(true);
        return;
      }
    }

    await restore();
    navigateBack();
  };

  if (completed) {
    return (
      <View style={styles.container}>
        <View style={styles.completedContent}>
          <VisitCheckIcon />
          <Text style={styles.completedTitle}>방문 인증 완료</Text>
          <Text style={styles.completedDescription}>
            방문 인증에 성공하고 <Text style={styles.highlight}>도장 1개</Text>를 획득했어요.
            {'\n'}도장 3개를 획득하면 보상을 수령할 수 있어요.
          </Text>
          <View style={styles.locationBadge}>
            <VisitLocationIcon size={20} />
            <Text style={styles.locationBadgeText}>{tourSpotName}</Text>
          </View>
        </View>

        <View
          style={[
            styles.completedBottomSheet,
            { paddingBottom: Math.max(40, insets.bottom + 14) },
          ]}
        >
          <Pressable
            style={[styles.closeButton, completionRestoring && styles.disabledCloseButton]}
            disabled={completionRestoring}
            onPress={handleCompletedClose}
          >
            <Text style={styles.closeButtonText}>닫기</Text>
          </Pressable>
          <Pressable
            style={[
              styles.stampStatusButton,
              !STAMP_DETAIL_ROUTE_AVAILABLE && styles.disabledStampStatusButton,
            ]}
            disabled={!STAMP_DETAIL_ROUTE_AVAILABLE}
            onPress={() => router.push(`/stamp-detail/${tourSpotId}` as never)}
          >
            <Text
              style={[
                styles.stampStatusButtonText,
                !STAMP_DETAIL_ROUTE_AVAILABLE && styles.disabledStampStatusButtonText,
              ]}
            >
              도장 현황 확인하기
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="방문 인증 종료"
        hitSlop={10}
        style={[styles.exitButton, { top: insets.top + 12 }]}
        onPress={() => setExitConfirmVisible(true)}
      >
        <CloseIcon size={32} color={Colors.gray.gray70} />
      </Pressable>

      <View style={[styles.header, { paddingTop: insets.top + 76 }]}>
        <View style={styles.countdownRow}>
          <Text style={styles.countdownValue}>{formatCountdown(remainingMs)}</Text>
          <Text style={styles.countdownSuffix}>내에</Text>
        </View>
        <Text style={styles.heading}>관광지에 도착해 주세요</Text>
        <Text style={styles.description}>
          관광지 300M 이내에서 도착 버튼을 눌러 주세요.{'\n'}
          7시간이 지나면 방문 인증이 자동으로 종료됩니다.
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText} numberOfLines={1} ellipsizeMode="tail">
            {tourSpotName}
          </Text>
        </View>
      </View>

      <View style={styles.spacerAbovePin} />
      <View style={styles.illustration}>
        <VisitPinIcon />
        <View style={styles.illustrationShadow}>
          <VisitPinShadowIcon />
        </View>
      </View>
      <View style={styles.spacerBelowPin} />

      <View
        style={[styles.bottomSheet, { paddingBottom: Math.max(40, insets.bottom + 14) }]}
      >
        <DojangTourButton
          status="arrived"
          onPress={submitting ? undefined : handleArrival}
        />
      </View>

      <AlertModal
        visible={exitConfirmVisible}
        title="종료하시겠습니까?"
        description="아직 방문 인증이 완료되지 않았습니다."
        cancelText="취소"
        confirmText="종료"
        onClose={() => setExitConfirmVisible(false)}
        onConfirm={handleStopVisit}
      />

      <AlertModal
        visible={tooFarVisible}
        title="너무 멀리 있어요"
        description="관광지 인근으로 이동 후 다시 시도해 주세요."
        confirmText="확인"
        confirmTextColor={Colors.blue.blue30}
        onClose={() => setTooFarVisible(false)}
        onConfirm={() => setTooFarVisible(false)}
      />

      <AlertModal
        visible={locationDeniedVisible}
        title="위치 권한이 필요해요"
        description={'방문 인증을 위해\n위치 권한을 허용해 주세요.'}
        cancelText="닫기"
        confirmText="설정으로 이동"
        confirmTextColor={Colors.blue.blue30}
        onClose={() => setLocationDeniedVisible(false)}
        onConfirm={() => {
          setLocationDeniedVisible(false);
          Linking.openSettings();
        }}
      />

      <AlertModal
        visible={locationUnavailableVisible}
        title="현재 위치를 확인할 수 없어요"
        description={'기기 위치 서비스를 켜거나 위치를 설정한 후\n다시 시도해 주세요.'}
        confirmText="확인"
        confirmTextColor={Colors.blue.blue30}
        onClose={() => setLocationUnavailableVisible(false)}
        onConfirm={() => setLocationUnavailableVisible(false)}
      />

      <ErrorModal
        visible={retryVisible}
        onCancel={() => setRetryVisible(false)}
        onRetry={() => {
          setRetryVisible(false);
          handleArrival();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray.gray00,
  },
  exitButton: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
  },
  header: {
    paddingHorizontal: 20,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countdownValue: {
    color: Colors.blue.blue30,
    fontSize: 26,
    lineHeight: 26 * 1.5,
    fontFamily: FontFamily.semiBold,
  },
  countdownSuffix: {
    color: Colors.gray.gray100,
    fontSize: 26,
    lineHeight: 26 * 1.5,
    fontFamily: FontFamily.semiBold,
  },
  heading: {
    color: Colors.gray.gray100,
    fontSize: 26,
    lineHeight: 26 * 1.5,
    fontFamily: FontFamily.semiBold,
  },
  description: {
    marginTop: 8,
    color: Colors.gray.gray80,
    fontSize: 16,
    lineHeight: 16 * 1.5,
    fontFamily: FontFamily.medium,
  },
  badge: {
    marginTop: 16,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    backgroundColor: Colors.gray.gray20,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    color: Colors.gray.gray70,
    fontSize: 14,
    lineHeight: 14 * 1.5,
    fontFamily: FontFamily.semiBold,
  },
  // 배지 하단~핀 상단(138px) : 핀 하단~버튼 영역 시작(179px) 비율(Figma 실측)을 화면 높이가
  // 달라도 유지하기 위해 고정 여백 대신 flex 비율로 분배한다(고정값으로 두면 화면이 클수록
  // 남는 공간이 전부 핀 아래로만 몰려 비율이 깨짐).
  spacerAbovePin: {
    flex: 138,
  },
  spacerBelowPin: {
    flex: 179,
  },
  illustration: {
    alignItems: 'center',
  },
  illustrationShadow: {
    marginTop: 14,
  },
  bottomSheet: {
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: Colors.gray.gray00,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  completedContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  completedTitle: {
    marginTop: 14,
    color: Colors.gray.gray90,
    fontSize: 26,
    lineHeight: 26 * 1.5,
    fontFamily: FontFamily.semiBold,
    textAlign: 'center',
  },
  completedDescription: {
    marginTop: 12,
    color: Colors.gray.gray80,
    fontSize: 16,
    lineHeight: 16 * 1.5,
    fontFamily: FontFamily.medium,
    textAlign: 'center',
  },
  highlight: {
    color: Colors.blue.blue20,
  },
  locationBadge: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.gray.gray20,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  locationBadgeText: {
    color: Colors.gray.gray70,
    fontSize: 16,
    lineHeight: 16 * 1.5,
    fontFamily: FontFamily.semiBold,
  },
  completedBottomSheet: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: Colors.gray.gray00,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  closeButton: {
    width: 106,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: Colors.gray.gray20,
  },
  disabledCloseButton: {
    opacity: 0.5,
  },
  closeButtonText: {
    color: Colors.gray.gray60,
    fontSize: 16,
    lineHeight: 16 * 1.5,
    fontFamily: FontFamily.semiBold,
  },
  stampStatusButton: {
    flex: 1,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: Colors.pink.pink40,
  },
  disabledStampStatusButton: {
    backgroundColor: Colors.gray.gray20,
  },
  stampStatusButtonText: {
    color: Colors.gray.gray00,
    fontSize: 16,
    lineHeight: 16 * 1.5,
    fontFamily: FontFamily.semiBold,
  },
  disabledStampStatusButtonText: {
    color: Colors.gray.gray60,
  },
});
