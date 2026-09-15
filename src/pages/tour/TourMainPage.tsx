import { getFestivalDetail } from '@/apis/festival';
import { geocodeAddress } from '@/apis/kakaoLocal';
import { isRetryableError, NetworkOfflineError } from '@/apis/client';
import { getMyStampTour } from '@/apis/stamp';
import { getTourSpotDetail, getTourSpots } from '@/apis/tour';
import { AlertModal } from '@/components/common/AlertModal';
import { ErrorModal } from '@/components/common/ErrorModal';
import { TOUR_SHEET_HEIGHT, TourBottomSheet } from '@/components/tour/TourBottomSheet';
import { MarkerGroupPicker, type MarkerGroupOption } from '@/components/tour/MarkerGroupPicker';
import { TourMap, type TourMapHandle, type TourMapMarker } from '@/components/tour/TourMap';
import { Colors, FontFamily, FontSize, Radius } from '@/constants/theme';
import { mapTourCategory } from '@/constants/tourCategory';
import { TourColors, TourTypography } from '@/constants/tourTheme';
import { useCurrentLocation } from '@/hooks/use-current-location';
import { useDelayedLoading } from '@/hooks/use-delayed-loading';
import type { StampTourDetail, TourAttraction, TourFilterCategory } from '@/types/tour';
import { groupByCoordinate, parseDistanceMeters, selectNearbySpots, type GeoPoint } from '@/utils/geo';
import { getCachedTourSpot, setCachedTourSpot } from '@/utils/tourSpotCache';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native';

type AttractionWithPoint = { attraction: TourAttraction; point: GeoPoint };

export default function TourMainPage() {
  const router = useRouter();
  const { empty } = useLocalSearchParams<{ empty?: string }>();

  const [expanded, setExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TourFilterCategory>('menu');

  const [stampTour, setStampTour] = useState<StampTourDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [failedRequest, setFailedRequest] = useState<{
    retry: () => void;
    isOffline: boolean;
  } | null>(null);
  const [locationDeniedDismissed, setLocationDeniedDismissed] = useState(false);
  const [locationUnavailableVisible, setLocationUnavailableVisible] = useState(false);
  // 진행 중인 스탬프 투어가 바뀌면(예: 투어 중단 후 다른 투어 시작) festivalId도 바뀌는데,
  // 새 축제의 좌표 조회(geocodeAddress)가 실패하면 이전 축제의 center가 남아 다른 축제의
  // 관광지 좌표와 함께 bounds 계산에 섞여 들어갈 수 있다. 어느 축제의 center인지 같이
  // 기록해서, 현재 festivalId와 일치할 때만 bounds에 반영한다.
  const [festivalCenter, setFestivalCenter] = useState<{
    festivalId: string;
    point: GeoPoint;
  } | null>(null);
  const [groupPickerOptions, setGroupPickerOptions] = useState<MarkerGroupOption[] | null>(null);
  const [navigatingAttractionId, setNavigatingAttractionId] = useState<string | null>(null);

  // 탭 재진입마다 다시 조회하는데(useFocusEffect), 응답이 빨리 오면 스피너를 아예 안 띄워서
  // 기존 화면이 깜빡이지 않게 한다.
  const showLoadingIndicator = useDelayedLoading(isLoading);
  // 상세 화면으로 넘어가기 전 미리 불러오는 동안 표시하는 작은 인디케이터도 같은 방식으로 지연 노출한다.
  const showNavigatingIndicator = useDelayedLoading(navigatingAttractionId !== null);

  const mapRef = useRef<TourMapHandle>(null);
  const {
    coords: userLocation,
    permission: locationPermission,
    canAskAgain: locationCanAskAgain,
    requestLocation,
    checkLocation,
  } = useCurrentLocation();

  // 탭을 벗어났다 돌아와도(투어 시작/중단 직후 등) 최신 상태를 다시 받아오도록 마운트가 아닌
  // 포커스 시점마다 조회한다 — 하단 탭은 화면이 유지된 채로 전환되기 때문에 마운트 1회로는 부족하다.
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const fetchStampTour = async () => {
        try {
          setIsLoading(true);
          const result = await getMyStampTour();
          if (isMounted) setStampTour(result);
        } catch (error) {
          console.error('스탬프 투어 조회 실패:', error);
          if (isMounted && isRetryableError(error)) {
            setFailedRequest({
              retry: () => setReloadTrigger((prev) => prev + 1),
              isOffline: error instanceof NetworkOfflineError,
            });
          }
        } finally {
          if (isMounted) setIsLoading(false);
        }
      };

      fetchStampTour();

      return () => {
        isMounted = false;
      };
      // reloadTrigger는 본문에서 읽지 않지만, 재시도 시 콜백 identity를 바꿔 포커스 상태에서도
      // useFocusEffect가 다시 실행되게 하는 용도다(react-navigation 공식 패턴).
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reloadTrigger]),
  );

  // 마운트 시엔 사용자 조작 없이 권한 대화상자가 뜨지 않도록 현재 권한 상태만 확인한다.
  // 권한 요청 자체는 위치 버튼을 눌렀을 때(handleLocationPress)만 한다.
  useEffect(() => {
    checkLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const locationDeniedVisible =
    locationPermission === 'denied' && !locationCanAskAgain && !locationDeniedDismissed;

  const festivalId = stampTour?.festivalId;

  // 축제 좌표(mapX/mapY) API가 없어서(docs/OPEN_QUESTIONS.md "C" 참고), 축제 상세의 address를
  // 카카오 로컬 API로 좌표 변환해 초기 지도 중심 보정에 쓴다. 실패해도 관광지 bounds로 대체되므로
  // 재시도·에러 모달 없이 best-effort로 처리한다.
  useEffect(() => {
    if (!festivalId) return;

    let isMounted = true;

    (async () => {
      try {
        const festival = await getFestivalDetail(festivalId);
        const center = await geocodeAddress(festival.address);
        if (isMounted) setFestivalCenter(center ? { festivalId, point: center } : null);
      } catch (error) {
        console.warn('축제 위치 조회 실패:', error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [festivalId]);

  // GET /api/v1/stamp-tour가 이미 축제 위치 기준 거리순으로 정렬해서 내려주므로, 여기선
  // 10km 반경 필터링·5개 미만 시 자동 확장만 계산한다(distance 필드 재사용, #37).
  const nearbySpots = useMemo(() => {
    if (!stampTour) return [];
    return selectNearbySpots(stampTour.tourSpots, (spot) =>
      parseDistanceMeters(spot.distance ?? ''),
    );
  }, [stampTour]);

  const attractionsWithPoint = useMemo<AttractionWithPoint[]>(
    () =>
      nearbySpots
        .map((spot) => {
          const category = mapTourCategory(spot.category);
          const point: GeoPoint = { lat: Number(spot.mapY), lng: Number(spot.mapX) };

          if (!category || !Number.isFinite(point.lat) || !Number.isFinite(point.lng)) {
            return null;
          }

          const attraction: TourAttraction = {
            id: spot.tourSpotId,
            title: spot.title,
            address: spot.address,
            category,
            distance: spot.distance ?? '',
            imageUrls: spot.imageUrl ? [spot.imageUrl] : [],
          };

          return { attraction, point };
        })
        .filter((item): item is AttractionWithPoint => item !== null),
    [nearbySpots],
  );

  const filteredItems = useMemo(
    () =>
      attractionsWithPoint.filter(
        (item) => selectedCategory === 'menu' || item.attraction.category === selectedCategory,
      ),
    [attractionsWithPoint, selectedCategory],
  );

  const attractions = useMemo(() => filteredItems.map((item) => item.attraction), [filteredItems]);

  // 좌표가 같은(주소가 같은) 관광지가 여러 개면 마커 하나에 아이콘을 나란히 묶어서 보여준다(#37).
  const markers = useMemo<TourMapMarker[]>(
    () =>
      groupByCoordinate(filteredItems, (item) => item.point).map((group) => ({
        id: group.items[0].attraction.id,
        memberIds: group.items.map((item) => item.attraction.id),
        categories: group.items.map((item) => item.attraction.category),
        lat: group.lat,
        lng: group.lng,
      })),
    [filteredItems],
  );

  useEffect(() => {
    const points = filteredItems.map((item) => item.point);
    if (festivalCenter && festivalCenter.festivalId === festivalId) points.push(festivalCenter.point);
    if (points.length === 0) return;

    mapRef.current?.focusOnBounds(points);
  }, [filteredItems, festivalCenter, festivalId]);

  // 이동하기 전에 상세 데이터를 먼저 받아둔다 — 화면을 바꾸고 나서 로딩을 띄우면 회색 화면이
  // 잠깐 끼어드는 느낌이 나서, 대신 이 화면을 유지한 채로 기다렸다가 데이터가 준비되면 그때
  // 상세 화면으로 부드럽게(페이드) 전환한다(#37, /visit 라우트에 fade 애니메이션 적용됨).
  const goToAttraction = async (attractionId: string) => {
    if (!festivalId || navigatingAttractionId) return;

    if (!getCachedTourSpot(festivalId, attractionId)) {
      setNavigatingAttractionId(attractionId);
      try {
        const [detail, spotList] = await Promise.all([
          getTourSpotDetail(festivalId, attractionId),
          getTourSpots(festivalId),
        ]);
        setCachedTourSpot(festivalId, attractionId, { detail, spots: spotList });
      } catch (error) {
        // 미리 받아오기가 실패해도 상세 화면 자체의 재시도 흐름으로 넘기면 되니 이동은 그대로 진행한다.
        console.warn('관광지 상세 미리 불러오기 실패:', error);
      } finally {
        setNavigatingAttractionId(null);
      }
    }

    router.push({ pathname: '/visit', params: { attractionId, festivalId } });
  };

  const handleAttractionPress = (attraction: TourAttraction) => {
    goToAttraction(attraction.id);
  };

  const handleMarkerPress = (markerId: string) => {
    const group = markers.find((marker) => marker.id === markerId);
    if (!group) return;

    if (group.memberIds.length <= 1) {
      goToAttraction(markerId);
      return;
    }

    // 좌표가 겹쳐 마커 하나로 합쳐진 경우 어디로 갈지 고르게 한다(#37).
    const options = group.memberIds
      .map((id) => attractionsWithPoint.find((item) => item.attraction.id === id)?.attraction)
      .filter((attraction): attraction is TourAttraction => !!attraction)
      .map((attraction) => ({
        id: attraction.id,
        title: attraction.title,
        category: attraction.category,
      }));

    setGroupPickerOptions(options);
  };

  const handleGroupPickerSelect = (attractionId: string) => {
    setGroupPickerOptions(null);
    goToAttraction(attractionId);
  };

  const handleLocationPress = async () => {
    if (userLocation) {
      mapRef.current?.focusOnCurrentLocation(userLocation.lat, userLocation.lng);
      return;
    }

    const result = await requestLocation();

    if (result.coords) {
      mapRef.current?.focusOnCurrentLocation(result.coords.lat, result.coords.lng);
      return;
    }

    if (result.permission === 'denied') {
      // 이미 닫았던 안내를 다시 눌렀을 때는 재노출한다.
      setLocationDeniedDismissed(false);
      return;
    }

    // 권한은 있는데(granted) 기기 위치 서비스가 꺼져 있는 등 좌표 자체를 못 가져온 경우.
    setLocationUnavailableVisible(true);
  };

  if (empty === '1' || (!isLoading && !stampTour)) {
    return (
      <View style={styles.noTourContainer}>
        <View style={styles.noTourIcon}>
          <Text style={styles.noTourIconText}>×</Text>
        </View>
        <Text style={styles.noTourTitle}>참여 중인 투어가 없어요.</Text>
        <Text style={styles.noTourDescription}>축제를 선택하고 투어를 시작해 보세요.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!stampTour ? (
        <View style={styles.loadingContainer}>
          {showLoadingIndicator && <ActivityIndicator color={Colors.pink.pink50} />}
        </View>
      ) : (
        <>
          <TourMap
            ref={mapRef}
            markers={markers}
            currentLocation={userLocation}
            locationBottom={
              expanded ? TOUR_SHEET_HEIGHT.expanded + 20 : TOUR_SHEET_HEIGHT.collapsed + 20
            }
            onSearchPress={() => router.push({ pathname: '/search/tour', params: { festivalId } })}
            onLocationPress={handleLocationPress}
            onMarkerPress={handleMarkerPress}
          />

          <TourBottomSheet
            expanded={expanded}
            title={stampTour.title}
            stampCount={stampTour.stampCount}
            selectedCategory={selectedCategory}
            attractions={attractions}
            onExpandedChange={setExpanded}
            onCategoryChange={(category) => {
              setSelectedCategory(category);
              setExpanded(true);
            }}
            onAttractionPress={handleAttractionPress}
          />
        </>
      )}

      {showNavigatingIndicator && (
        <View pointerEvents="none" style={styles.navigatingBadge}>
          <ActivityIndicator size="small" color={Colors.pink.pink50} />
        </View>
      )}

      <ErrorModal
        visible={failedRequest !== null}
        title={failedRequest?.isOffline ? '오프라인 상태예요' : undefined}
        description={
          failedRequest?.isOffline
            ? '인터넷 연결을 확인한 후 다시 시도해 주세요.'
            : undefined
        }
        onCancel={() => setFailedRequest(null)}
        onRetry={() => {
          const retry = failedRequest?.retry;
          setFailedRequest(null);
          retry?.();
        }}
      />

      <AlertModal
        visible={locationDeniedVisible}
        title="위치 권한이 필요해요"
        description={'설정에서 위치 권한을 허용하면\n내 위치와 거리순 정렬을 이용할 수 있어요.'}
        cancelText="닫기"
        confirmText="설정 열기"
        onClose={() => setLocationDeniedDismissed(true)}
        onConfirm={() => {
          setLocationDeniedDismissed(true);
          Linking.openSettings();
        }}
      />

      <AlertModal
        visible={locationUnavailableVisible}
        title="위치를 가져올 수 없어요"
        description={'기기의 위치 서비스(GPS)가 켜져 있는지\n확인한 후 다시 시도해 주세요.'}
        confirmText="확인"
        onClose={() => setLocationUnavailableVisible(false)}
        onConfirm={() => setLocationUnavailableVisible(false)}
      />

      <MarkerGroupPicker
        visible={groupPickerOptions !== null}
        options={groupPickerOptions ?? []}
        onSelect={handleGroupPickerSelect}
        onClose={() => setGroupPickerOptions(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: Colors.gray.gray20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navigatingBadge: {
    position: 'absolute',
    top: 106,
    alignSelf: 'center',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    backgroundColor: Colors.gray.gray00,
    boxShadow: TourColors.locationShadow,
  },
  noTourContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray.gray00,
  },
  noTourIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: TourColors.gray50,
    borderRadius: Radius.full,
  },
  noTourIconText: {
    color: TourColors.gray50,
    fontSize: TourTypography.compact,
  },
  noTourTitle: {
    color: Colors.gray.gray70,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    fontFamily: FontFamily.medium,
  },
  noTourDescription: {
    color: Colors.gray.gray60,
    fontSize: FontSize.xs,
    lineHeight: 18,
    fontFamily: FontFamily.regular,
  },
});
