import { getFestivalDetail } from '@/apis/festival';
import { geocodeAddress } from '@/apis/kakaoLocal';
import { NetworkOfflineError } from '@/apis/client';
import { getMyStampTour } from '@/apis/stamp';
import { getTourSpotDetail, getTourSpots } from '@/apis/tour';
import { LocationProblemModal } from '@/components/tour/LocationProblemModal';
import { TourAsset } from '@/components/tour/TourAsset';
import type { LocationProblem } from '@/utils/locationPolicy';
import { ErrorModal } from '@/components/common/ErrorModal';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { TOUR_SHEET_HEIGHT, TourBottomSheet } from '@/components/tour/TourBottomSheet';
import { TourMap, type TourMapHandle, type TourMapMarker } from '@/components/tour/TourMap';
import { Colors, FontFamily, FontSize } from '@/constants/theme';
import { mapTourCategory } from '@/constants/tourCategory';
import { useCurrentLocation } from '@/hooks/use-current-location';
import { useDelayedLoading } from '@/hooks/use-delayed-loading';
import type { StampTourDetail, TourAttraction, TourFilterCategory } from '@/types/tour';
import { declutterCoordinates, parseDistanceMeters, selectNearbySpots, type GeoPoint } from '@/utils/geo';
import { getCachedTourSpot, setCachedTourSpot } from '@/utils/tourSpotCache';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
  const [locationProblem, setLocationProblem] = useState<LocationProblem | null>(null);
  const [sheetHeight, setSheetHeight] = useState<number>(TOUR_SHEET_HEIGHT.collapsed);
  const [stampCountFresh, setStampCountFresh] = useState(false);
  const locationRequestRef = useRef(false);
  // 진행 중인 스탬프 투어가 바뀌면(예: 투어 중단 후 다른 투어 시작) festivalId도 바뀌는데,
  // 새 축제의 좌표 조회(geocodeAddress)가 실패하면 이전 축제의 center가 남아 다른 축제의
  // 관광지 좌표와 함께 bounds 계산에 섞여 들어갈 수 있다. 어느 축제의 center인지 같이
  // 기록해서, 현재 festivalId와 일치할 때만 bounds에 반영한다.
  const [festivalCenter, setFestivalCenter] = useState<{
    festivalId: string;
    point: GeoPoint;
  } | null>(null);
  const [navigatingAttractionId, setNavigatingAttractionId] = useState<string | null>(null);

  // 탭 재진입마다 다시 조회하는데(useFocusEffect), 응답이 빨리 오면 스피너를 아예 안 띄워서
  // 기존 화면이 깜빡이지 않게 한다.
  const showLoadingIndicator = useDelayedLoading(isLoading);
  // 상세 화면으로 넘어가기 전 미리 불러오는 동안 표시하는 작은 인디케이터도 같은 방식으로 지연 노출한다.
  const showNavigatingIndicator = useDelayedLoading(navigatingAttractionId !== null);

  const mapRef = useRef<TourMapHandle>(null);
  const {
    coords: userLocation,
    isLoading: isLocationLoading,
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
          setStampCountFresh(false);
          const result = await getMyStampTour();
          if (isMounted) { setStampTour(result); setStampCountFresh(true); }
        } catch (error) {
          console.error('스탬프 투어 조회 실패:', error);
          if (isMounted) {
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

  const festivalId = stampTour?.festivalId;

  // 지도 SDK 준비 여부 — 바텀시트/검색바 등 나머지 UI도 이 시점까지 같이 가려서
  // 컴포넌트 단위가 아니라 페이지 전체가 한 번에 로딩되도록 한다.
  const [mapReady, setMapReady] = useState(false);
  const [mapLoadError, setMapLoadError] = useState(false);
  const showMapLoadingIndicator = useDelayedLoading(!mapReady && !mapLoadError);

  // 투어가 바뀌면(중단 후 다른 투어 시작 등) TourMap이 새로 마운트되어 다시 로딩되므로 같이
  // 초기화한다(React 공식 "Adjusting state on prop change" 패턴 — useEffect로 하면
  // set-state-in-effect 린트에 걸리고 한 프레임 늦게 반영된다).
  const [prevFestivalId, setPrevFestivalId] = useState(festivalId);
  if (festivalId !== prevFestivalId) {
    setPrevFestivalId(festivalId);
    setMapReady(false);
    setMapLoadError(false);
  }

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

          if (!category || !spot.mapY.trim() || !spot.mapX.trim() ||
            !Number.isFinite(point.lat) || !Number.isFinite(point.lng)) {
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

  // 좌표가 같은(주소가 같은) 관광지가 여러 개여도 마커는 하나로 합치지 않고 각자 유지하되,
  // 겹쳐 보이지 않도록 declutterCoordinates가 서로 살짝 밀어내 배치한다(#37, PM 요청으로 방향 전환).
  const markers = useMemo<TourMapMarker[]>(
    () =>
      declutterCoordinates(filteredItems, (item) => item.point).map((item) => ({
        id: item.attraction.id,
        categories: [item.attraction.category],
        lat: item.point.lat,
        lng: item.point.lng,
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
        if (detail) setCachedTourSpot(festivalId, attractionId, { detail, spots: spotList });
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
    goToAttraction(markerId);
  };

  const handleLocationPress = async () => {
    if (locationRequestRef.current) return;
    locationRequestRef.current = true;
    setLocationProblem(null);
    try {
      const result = await requestLocation();
      if (result.coords) mapRef.current?.focusOnCurrentLocation(result.coords.lat, result.coords.lng);
      else setLocationProblem(result.problem);
    } finally { locationRequestRef.current = false; }
  };

  if (empty === '1' || (!isLoading && !stampTour && !failedRequest)) {
    return (
      <View style={styles.noTourContainer}>
        <TourAsset name="empty" />
        <Text style={styles.noTourText}>
          {'참여 중인 투어가 없어요.\n축제를 선택하고 투어를 시작해 보세요.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!stampTour ? (
        <View style={styles.loadingContainer}>
          {showLoadingIndicator && <LoadingIndicator />}
        </View>
      ) : (
        <>
          <TourMap
            ref={mapRef}
            markers={markers}
            currentLocation={userLocation}
            locationBottom={
              sheetHeight + 20
            }
            onSearchPress={() => router.push({ pathname: '/search/tour', params: { festivalId } })}
            onLocationPress={handleLocationPress}
            onMarkerPress={handleMarkerPress}
            onReady={() => setMapReady(true)}
            onLoadError={() => setMapLoadError(true)}
            isLocationLoading={isLocationLoading}
          />

          <TourBottomSheet
            expanded={expanded}
            title={stampTour.title}
            stampCount={stampCountFresh ? stampTour.stampCount : null}
            onHeightChange={setSheetHeight}
            selectedCategory={selectedCategory}
            attractions={attractions}
            onExpandedChange={setExpanded}
            onCategoryChange={(category) => {
              setSelectedCategory(category);
              setExpanded(true);
            }}
            onAttractionPress={handleAttractionPress}
          />

          {/* 지도 SDK가 뜰 때까지 바텀시트·검색바까지 같이 가려서 컴포넌트 단위가 아닌
              페이지 단위 로딩으로 보이게 한다. 에러가 나면 TourMap 자체의 재시도 UI로 넘긴다. */}
          {!mapReady && !mapLoadError && (
            <View style={[StyleSheet.absoluteFill, styles.loadingContainer, styles.pageLoadingOverlay]}>
              {showMapLoadingIndicator && <LoadingIndicator />}
            </View>
          )}
        </>
      )}

      {/* 관광지 상세로 이동하기 전 데이터를 미리 받아두는 동안(#37) — 화면은 그대로 두되
          작은 배지 대신 페이지 전체를 덮어서, 오래 걸릴 때 멈춘 것처럼 보이지 않게 한다. */}
      {showNavigatingIndicator && (
        <View style={[StyleSheet.absoluteFill, styles.loadingContainer, styles.pageLoadingOverlay]}>
          <LoadingIndicator />
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

      <LocationProblemModal problem={locationProblem} purpose="map" onClose={() => setLocationProblem(null)} />
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
  pageLoadingOverlay: {
    backgroundColor: Colors.gray.gray20,
  },
  noTourContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray.gray00,
  },
  noTourText: {
    marginTop: 4,
    color: Colors.gray.gray60,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    fontFamily: FontFamily.medium,
    textAlign: 'center',
  },
});
