import { getTourSpotDetail } from '@/apis/tour';
import { distanceMeters } from '@/utils/geo';
import { LocationProblemModal } from '@/components/tour/LocationProblemModal';
import type { LocationProblem } from '@/utils/locationPolicy';
import { ApiError, getServerNowMs } from '@/apis/client';
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
import { getRecentLocationSnapshot, useCurrentLocation } from '@/hooks/use-current-location';
import { useTourVisitStore } from '@/stores/tourVisitStore';
import type { TourSpotDetail } from '@/types/tour';
import { getCachedTourSpot } from '@/utils/tourSpotCache';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MAX_VISIT_DURATION_MS = 7 * 60 * 60 * 1000;
const ARRIVAL_RADIUS_M = 300;
const RECENT_LOCATION_MAX_AGE_MS = 10_000;
const RECENT_LOCATION_MOVEMENT_BUFFER_M = 100;

function getTourSpotPoint(spot: TourSpotDetail | null) {
  if (!spot?.mapY?.trim() || !spot.mapX?.trim()) return null;
  const point = { lat: Number(spot.mapY), lng: Number(spot.mapX) };
  if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng) ||
    Math.abs(point.lat) > 90 || Math.abs(point.lng) > 180) return null;
  return point;
}

function formatCountdown(remainingMs: number) {
  // 남은 시간이 실제로 만료되기 전에 00:00:00이 먼저 표시되지 않도록 올림한다.
  const totalSeconds = Math.max(0, Math.ceil(Math.min(remainingMs, MAX_VISIT_DURATION_MS) / 1000));
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
  const completeVisit = useTourVisitStore((state) => state.complete);

  const [remainingMs, setRemainingMs] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const expirationHandledRef = useRef(false);
  const [exitConfirmVisible, setExitConfirmVisible] = useState(false);
  const [tooFarVisible, setTooFarVisible] = useState(false);
  const [locationProblem, setLocationProblem] = useState<LocationProblem | null>(null);
  const arrivalPending = useRef(false);
  const [retryVisible, setRetryVisible] = useState(false);

  const navigateBack = () => {
    // 딥링크·화면 잠금 해제 직후에는 canGoBack()이 true여도 실제 back stack이 없어
    // GO_BACK 경고가 날 수 있다. 체크인 종료 지점은 항상 투어 메인으로 명시 이동한다.
    router.replace('/(tabs)/tour');
  };

  const handleCompletedClose = () => {
    completeVisit();
    router.replace('/(tabs)/stamp');
  };

  const handleStampStatus = () => {
    if (!festivalId) return;
    completeVisit();
    router.replace({ pathname: '/stamp-detail/[id]', params: { id: festivalId } });
  };

  // 방문 시작 직후 이 화면은 라우팅 가드가 스택에서 이전 화면(visit)을 빼버리므로, 기본
  // 뒤로가기(pop)를 그대로 두면 이미 낡은 화면으로 튕겨 서버 상태와 어긋난다(방문 세션이
  // 여전히 진행 중이라 "요청이 현재 상태와 충돌합니다" 에러로 이어짐). 그래서 하드웨어
  // 뒤로가기를 직접 처리한다: 완료 상태면 도장 탭으로, 아니면(진행 중) 바로 앱을 종료한다.
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (completed) {
          handleCompletedClose();
        } else {
          BackHandler.exitApp();
        }
        return true;
      });

      return () => subscription.remove();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [completed, festivalId]),
  );

  // 서버가 내려준 expiresAt 기준으로 매초 다시 계산한다(로컬에서 7시간을 새로 세지 않음).
  useEffect(() => {
    if (!expiresAt || completed) return;

    expirationHandledRef.current = false;

    const handleExpiration = async () => {
      // 모달 뒤에서도 타이머는 절대 만료시각을 기준으로 흐른다. 만료 시 열린 모달을
      // 모두 닫고 서버 상태 복원이 끝난 뒤 체크인 화면을 강제로 종료한다.
      setExitConfirmVisible(false);
      setTooFarVisible(false);
      setLocationProblem(null);
      setRetryVisible(false);
      setSubmitting(false);

      await restore();
      router.replace('/(tabs)/tour');
    };

    const tick = () => {
      // 방문 API 응답의 Date 헤더로 보정한 서버 시각을 사용한다. 기기 시계가 서버보다
      // 느려도 07:00:xx로 시작하지 않으며, 백그라운드·재진입 후에도 expiresAt은 그대로다.
      const remaining = new Date(expiresAt).getTime() - getServerNowMs();
      setRemainingMs(Math.max(0, remaining));

      if (remaining <= 0 && !expirationHandledRef.current) {
        expirationHandledRef.current = true;
        void handleExpiration();
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, completed, restore, router]);

  // 취소·만료 등으로 다른 곳에서 활성 방문이 종료되면 화면 잠금이 풀리므로 이 화면도 빠져나간다.
  // 도장 획득 완료 화면은 예외 — 사용자가 닫기/도장 확인을 누를 때까지 유지한다.
  useEffect(() => {
    if (completed || expirationHandledRef.current) return;
    if (status === 'idle') navigateBack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, completed]);

  const handleArrival = async () => {
    if (arrivalPending.current || completed) return;
    if (!festivalId || !tourSpotId) {
      setRetryVisible(true);
      return;
    }

    arrivalPending.current = true;
    setSubmitting(true);
    setTooFarVisible(false);
    setLocationProblem(null);
    try {
      const cachedSpot = getCachedTourSpot(festivalId, tourSpotId)?.detail ?? null;
      const cachedTarget = getTourSpotPoint(cachedSpot);
      const recentLocation = getRecentLocationSnapshot(RECENT_LOCATION_MAX_AGE_MS);

      // 방문 시작 직전에 얻은 고정밀 좌표로도 명백히 범위 밖이면 OS GPS와 API를 다시
      // 기다리지 않는다. 정확도 오차와 이동 여유분은 거리에서 제외해 경계 근처는 반드시
      // 아래의 새 GPS 및 서버 판정으로 확인한다.
      if (cachedTarget && recentLocation &&
        distanceMeters(recentLocation.coords, cachedTarget) >
          ARRIVAL_RADIUS_M + recentLocation.accuracy + RECENT_LOCATION_MOVEMENT_BUFFER_M) {
        const active = useTourVisitStore.getState();
        if (expirationHandledRef.current || active.tourSpotId !== tourSpotId || active.status !== 'active') return;
        setTooFarVisible(true);
        return;
      }

      // 캐시가 없는 복원 진입에서도 GPS와 관광지 상세 API를 병렬로 기다린다.
      const [result, spot] = await Promise.all([
        requestLocation(),
        cachedSpot ? Promise.resolve(cachedSpot) : getTourSpotDetail(festivalId, tourSpotId),
      ]);
      if (!result.coords) {
        setLocationProblem(result.problem);
        return;
      }
      if (!spot) {
        setRetryVisible(true);
        return;
      }
      const target = getTourSpotPoint(spot);
      if (!target) {
        setRetryVisible(true);
        return;
      }
      // 위치 조회 중 만료되거나 다른 방문으로 전환됐으면 이전 방문에 인증하지 않는다.
      const active = useTourVisitStore.getState();
      if (expirationHandledRef.current || active.tourSpotId !== tourSpotId || active.status !== 'active') return;
      if (distanceMeters(result.coords, target) > ARRIVAL_RADIUS_M) {
        setTooFarVisible(true);
        return;
      }

      await createTourSpotStamp(festivalId, tourSpotId, {
        mapX: result.coords.lng,
        mapY: result.coords.lat,
      });
      setCompleted(true);
    } catch (error) {
      if (error instanceof ApiError && error.code === 'STAMP-400-001') {
        setTooFarVisible(true);
        return;
      }
      setRetryVisible(true);
    } finally {
      // 위치 권한 요청 자체가 예외를 던져도 버튼이 영구 비활성화되지 않게 한다.
      arrivalPending.current = false;
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
            style={styles.closeButton}
            onPress={handleCompletedClose}
          >
            <Text style={styles.closeButtonText}>닫기</Text>
          </Pressable>
          <Pressable
            style={styles.stampStatusButton}
            onPress={handleStampStatus}
          >
            <Text style={styles.stampStatusButtonText}>
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
          loading={submitting}
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

      <LocationProblemModal problem={locationProblem} purpose="visit" onClose={() => setLocationProblem(null)} />

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
  stampStatusButtonText: {
    color: Colors.gray.gray00,
    fontSize: 16,
    lineHeight: 16 * 1.5,
    fontFamily: FontFamily.semiBold,
  },
});
