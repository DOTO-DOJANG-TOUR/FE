import { ApiError, isRetryableError, NetworkOfflineError } from '@/apis/client';
import { getTourSpotDetail, getTourSpots } from '@/apis/tour';
import { startTourSpotVisit } from '@/apis/tourVisit';
import { ErrorModal } from '@/components/common/ErrorModal';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { LocationProblemModal } from '@/components/tour/LocationProblemModal';
import { TourDetailBottomSheet } from '@/components/tour/TourDetailBottomSheet';
import { TourMap, type TourMapHandle, type TourMapMarker } from '@/components/tour/TourMap';
import { Colors } from '@/constants/theme';
import { mapTourCategory } from '@/constants/tourCategory';
import { useCurrentLocation } from '@/hooks/use-current-location';
import { useDelayedLoading } from '@/hooks/use-delayed-loading';
import { useLiveLocationWatch } from '@/hooks/use-live-location-watch';
import { useTourVisitStore } from '@/stores/tourVisitStore';
import type { TourAttraction, TourCategory, TourContent, TourSpotDetail } from '@/types/tour';
import { declutterCoordinates, type GeoPoint } from '@/utils/geo';
import type { LocationProblem } from '@/utils/locationPolicy';
import { getCachedTourSpot, setCachedTourSpot } from '@/utils/tourSpotCache';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const DUPLICATE_VISIT_ERROR_CODES = new Set([
  'STAMP-TOUR-409-002',
  'TOUR-SPOT-VISIT-409-001',
  'STAMP-409-001',
]);
const EXPANDED_MARKER_OFFSET_Y = 36;

export default function TourVisitPage() {
  const router = useRouter();
  const { attractionId, festivalId } = useLocalSearchParams<{
    attractionId?: string;
    festivalId?: string;
  }>();

  const { coords: userLocation, checkLocation, requestLocation } = useCurrentLocation();
  const { coords: liveLocation, refresh: refreshLiveLocation } = useLiveLocationWatch();
  const [locationProblem, setLocationProblem] = useState<LocationProblem | null>(null);
  const [mapLocationProblem, setMapLocationProblem] = useState<LocationProblem | null>(null);
  const [isLocationButtonLoading, setIsLocationButtonLoading] = useState(false);
  const [sheetLiveHeight, setSheetLiveHeight] = useState(0);
  const locationRequestRef = useRef(false);
  useEffect(() => { void checkLocation(); }, [checkLocation]);
  const [expanded, setExpanded] = useState(true);
  // 투어 메인 화면에서 이동하기 전에 미리 받아둔 데이터가 있으면(#37, tourSpotCache 참고)
  // 첫 렌더부터 바로 써서 로딩 화면 자체를 건너뛴다.
  const initialCached =
    festivalId && attractionId ? getCachedTourSpot(festivalId, attractionId) : undefined;
  const [detail, setDetail] = useState<TourSpotDetail | null>(initialCached?.detail ?? null);
  const detailRef = useRef<TourSpotDetail | null>(detail);
  const [spots, setSpots] = useState<TourContent[]>(initialCached?.spots ?? []);
  const [isLoading, setIsLoading] = useState(
    () => !!festivalId && !!attractionId && !initialCached,
  );
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [failedRequest, setFailedRequest] = useState<{
    retry: () => void;
    isOffline: boolean;
  } | null>(null);
  const [retryVisible, setRetryVisible] = useState(false);
  const [duplicateVisitMessage, setDuplicateVisitMessage] = useState<string | null>(null);
  const [detailSheetHeight, setDetailSheetHeight] = useState<number | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapLoadError, setMapLoadError] = useState(false);

  const mapRef = useRef<TourMapHandle>(null);
  const lastFocusedLayoutRef = useRef<string | null>(null);
  // 응답이 빨리 오면 스피너를 아예 안 띄워서 화면 전환이 반짝이지 않게 한다.
  const showLoadingIndicator = useDelayedLoading(isLoading);
  const showMapLoadingIndicator = useDelayedLoading(!mapReady && !mapLoadError);

  useEffect(() => {
    detailRef.current = detail;
  }, [detail]);

  // 지도에서 다른 마커를 눌러 attractionId가 바뀌면(같은 화면 인스턴스가 재사용됨) 이전 관광지의
  // expanded 상태가 남아있지 않도록 렌더 중에 리셋한다(React 공식 "Adjusting state on prop
  // change" 패턴 — useEffect로 하면 set-state-in-effect 린트에 걸리고 한 프레임 늦게 반영된다).
  // 방문 여부(visited)는 detail.isVisited에서 그대로 파생하므로 별도로 리셋할 상태가 없다.
  const [prevAttractionId, setPrevAttractionId] = useState(attractionId);
  if (attractionId !== prevAttractionId) {
    setPrevAttractionId(attractionId);
    setExpanded(true);

    // 이동할 관광지가 이미 캐시에 있으면(다시 보는 마커 등) 바로 반영한다. 없으면 이전 관광지 내용을
    // 그대로 유지해서(아래 effect가 백그라운드로 새로 받아올 때까지) 화면이 깜빡이지 않게 한다.
    const cached = festivalId && attractionId ? getCachedTourSpot(festivalId, attractionId) : undefined;
    if (cached) {
      setDetail(cached.detail);
      setSpots(cached.spots);
    }
  }

  useEffect(() => {
    if (!festivalId || !attractionId) return;

    let isMounted = true;

    const fetchData = async () => {
      try {
        // 캐시가 있으면 기존 상세를 즉시 보여주고, 로딩 화면 없이 최신 필드를 백그라운드에서
        // 갱신한다. 캐시가 없거나 다른 관광지 데이터만 남아 있을 때만 전체 로딩을 표시한다.
        if (detailRef.current?.tourSpotId !== attractionId) setIsLoading(true);
        const [spotDetail, allSpots] = await Promise.all([
          getTourSpotDetail(festivalId, attractionId),
          getTourSpots(festivalId),
        ]);

        if (isMounted) {
          setDetail(spotDetail);
          setSpots(allSpots);
          if (spotDetail) {
            setCachedTourSpot(festivalId, attractionId, { detail: spotDetail, spots: allSpots });
          }
        }
      } catch (error) {
        console.error('관광지 상세 조회 실패:', error);
        if (isMounted) {
          // 전환 실패 시 이전 관광지 내용을 그대로 유지하면 URL·선택 마커는 새 관광지를
          // 가리키는데 상세 시트는 이전 관광지를 보여주는 상태가 된다 — 이전 관광지로
          // 되돌려서 화면 전체가 다시 일치하게 한다.
          const visibleDetail = detailRef.current;
          if (visibleDetail && visibleDetail.tourSpotId !== attractionId) {
            router.setParams({ attractionId: visibleDetail.tourSpotId });
          }
          if (isRetryableError(error)) {
            setFailedRequest({
              retry: () => setReloadTrigger((prev) => prev + 1),
              isOffline: error instanceof NetworkOfflineError,
            });
          }
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [festivalId, attractionId, reloadTrigger, router]);

  const attraction = useMemo<TourAttraction | null>(() => {
    if (!detail) return null;

    const category = mapTourCategory(detail.category);
    if (!category) return null;

    return {
      id: detail.tourSpotId,
      title: detail.title.trim() || '관광지',
      address: detail.address.trim(),
      category,
      // 상세 화면(TourDetailBottomSheet)엔 거리를 보여주는 UI가 없어 계산하지 않는다.
      distance: '',
      imageUrls: detail.imageList.length ? detail.imageList : detail.imageUrl ? [detail.imageUrl] : [],
      phone: detail.phone?.trim() || undefined,
      homepage: detail.homepage?.trim() || undefined,
      visited: detail.isVisited,
    };
  }, [detail]);

  // 좌표가 같은(주소가 같은) 관광지가 여러 개여도 마커는 하나로 합치지 않고 각자 유지하되,
  // 겹쳐 보이지 않도록 declutterCoordinates가 서로 살짝 밀어내 배치한다(#37, PM 요청으로 방향 전환).
  const markers = useMemo<TourMapMarker[]>(() => {
    const validSpots = spots
      .map((spot) => {
        const category = mapTourCategory(spot.category);
        const point: GeoPoint = { lat: Number(spot.mapY), lng: Number(spot.mapX) };

        if (!category || !spot.mapY.trim() || !spot.mapX.trim() ||
          !Number.isFinite(point.lat) || !Number.isFinite(point.lng)) return null;

        return { id: spot.tourSpotId, category, point };
      })
      .filter(
        (item): item is { id: string; category: TourCategory; point: GeoPoint } => item !== null,
      );

    return declutterCoordinates(validSpots, (item) => item.point).map((item) => ({
      id: item.id,
      categories: [item.category],
      lat: item.point.lat,
      lng: item.point.lng,
    }));
  }, [spots]);

  // 최초 진입과 시트 스냅 높이 변경 시 선택 마커를 실제로 보이는 지도 영역의 중앙에 둔다.
  // 다른 마커 선택은 navigateToAttraction이 먼저 처리하며, focusKey로 데이터 도착 후 중복 이동을 막는다.
  useEffect(() => {
    if (!detail || detail.tourSpotId !== attractionId || detailSheetHeight === null) return;

    const lat = Number(detail.mapY);
    const lng = Number(detail.mapX);
    if (!detail.mapY.trim() || !detail.mapX.trim() ||
      !Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const focusKey = expanded
      ? `${detail.tourSpotId}:expanded:${detailSheetHeight}`
      : `${detail.tourSpotId}:collapsed`;
    if (lastFocusedLayoutRef.current === focusKey) return;

    // 펼친 상태에서는 시트를 제외한 지도 영역의 중앙보다 살짝 아래에 두고, 접힌 상태에서는
    // 기존 동작처럼 전체 지도 화면의 정중앙에 둔다.
    mapRef.current?.focusOnMarker(lat, lng, {
      animate: lastFocusedLayoutRef.current !== null,
      bottomInset: expanded ? detailSheetHeight : 0,
      markerOffsetY: expanded ? EXPANDED_MARKER_OFFSET_Y : 0,
    });
    lastFocusedLayoutRef.current = focusKey;
  }, [attractionId, detail, detailSheetHeight, expanded]);

  const navigateToAttraction = (targetId: string) => {
    if (targetId === attractionId) return;

    // 상세 데이터(전화번호 등)를 기다리지 않고, 이미 갖고 있는 좌표로 지도부터 바로 부드럽게 이동시킨다.
    // 상세 정보는 뒤에서 이어서 불러오고, 화면은 이전 관광지 내용을 유지하다가 도착하면 자연스럽게
    // 바뀐다(로딩 화면으로 깜빡이지 않는다, #37).
    const target = spots.find((spot) => spot.tourSpotId === targetId);
    const lat = target ? Number(target.mapY) : NaN;
    const lng = target ? Number(target.mapX) : NaN;
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      mapRef.current?.focusOnMarker(lat, lng, {
        bottomInset: expanded ? (detailSheetHeight ?? 0) : 0,
        markerOffsetY: expanded ? EXPANDED_MARKER_OFFSET_Y : 0,
      });
      lastFocusedLayoutRef.current = expanded
        ? `${targetId}:expanded:${detailSheetHeight ?? 0}`
        : `${targetId}:collapsed`;
    }

    // push/replace 둘 다 화면(과 그 안의 지도 WebView)을 통째로 재마운트시켜서 전환마다
    // 지도가 처음부터 다시 로드되며 흰 화면이 깜빡였다 — setParams는 같은 화면 인스턴스를 유지한
    // 채 파라미터만 바꿔서 지도가 다시 로드되지 않는다(#37).
    router.setParams({ attractionId: targetId });
  };

  const handleMarkerPress = (markerId: string) => {
    navigateToAttraction(markerId);
  };

  const handleLocationPress = async () => {
    if (locationRequestRef.current) return;
    locationRequestRef.current = true;
    setIsLocationButtonLoading(true);
    setMapLocationProblem(null);
    try {
      const result = await requestLocation();
      if (result.coords) {
        // 이 화면에 처음 들어와 권한이 없던 상태였다면 실시간 구독이 아직 시작 못 했을 수
        // 있다 — 방금 허용됐으니 다시 시작한다.
        refreshLiveLocation();
        // 관광지 상세는 마커를 선택할 때와 마찬가지로 바텀시트에 가려지지 않는 영역
        // 기준으로 중앙 정렬한다(투어 메인은 바텀시트를 뺀 정렬을 안 쓰므로 그대로 둔다).
        mapRef.current?.focusOnCurrentLocation(
          result.coords.lat, result.coords.lng, undefined,
          expanded ? detailSheetHeight ?? 0 : 0,
        );
      } else {
        setMapLocationProblem(result.problem);
      }
    } finally {
      locationRequestRef.current = false;
      setIsLocationButtonLoading(false);
    }
  };

  const handleVisit = async () => {
    if (!attraction || !festivalId) return;

    try {
      const response = await startTourSpotVisit(festivalId, attraction.id);
      await useTourVisitStore.getState().start({
        festivalId,
        tourSpotId: response.tourSpotId,
        tourSpotName: response.tourSpotName,
        expiresAt: response.expiresAt,
      });
      router.replace('/check-in');
    } catch (error) {
      if (error instanceof ApiError && DUPLICATE_VISIT_ERROR_CODES.has(error.code ?? '')) {
        setDuplicateVisitMessage(error.message);
        return;
      }
      setRetryVisible(true);
    }
  };

  if (!isLoading && !attraction && !failedRequest) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>관광지 정보를 찾을 수 없어요.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!attraction ? (
        <View style={styles.loadingContainer}>
          {showLoadingIndicator && <LoadingIndicator />}
        </View>
      ) : (
        <>
          <TourMap
            ref={mapRef}
            markers={markers}
            selectedMarkerId={attractionId}
            currentLocation={liveLocation ?? userLocation}
            locationBottom={sheetLiveHeight}
            locationBottomOffset={20}
            onSearchPress={() => router.push({ pathname: '/search/tour', params: { festivalId } })}
            onLocationPress={handleLocationPress}
            onMarkerPress={handleMarkerPress}
            onReady={() => setMapReady(true)}
            onLoadError={() => setMapLoadError(true)}
            isLocationLoading={isLocationButtonLoading}
          />
          <TourDetailBottomSheet
            attraction={attraction}
            expanded={expanded}
            visited={!!attraction?.visited}
            onHeightChange={setDetailSheetHeight}
            onLiveHeightChange={setSheetLiveHeight}
            onClose={() => {
              // router.canGoBack()이 true를 반환해도 실제 back()이 처리되지 않아
              // GO_BACK 에러가 나는 경우가 있어(#53), 뒤로가기 대신 투어 메인으로
              // 명시적으로 이동한다. 검색 결과에서 들어온 경우에도 동일하게 투어
              // 메인으로 닫힌다(검색 상태는 보존되지 않음).
              router.replace('/(tabs)/tour');
            }}
            onExpandedChange={setExpanded}
            onVisited={handleVisit}
            onRequestVisit={async () => {
              setLocationProblem(null);
              const result = await requestLocation();
              if (result.problem) { setLocationProblem(result.problem); return false; }
              return !!result.coords;
            }}
          />

          {/* 캐시된 상세가 있어도 지도 WebView는 새로 준비해야 한다. 준비 중에는 투어 메인과
              동일하게 지도·상세 시트를 함께 가리고, 실패하면 TourMap의 재시도 UI를 보여준다. */}
          {!mapReady && !mapLoadError && (
            <View style={[StyleSheet.absoluteFill, styles.loadingContainer, styles.pageLoadingOverlay]}>
              {showMapLoadingIndicator && <LoadingIndicator />}
            </View>
          )}
        </>
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

      <ErrorModal
        visible={retryVisible}
        onCancel={() => setRetryVisible(false)}
        onRetry={() => {
          setRetryVisible(false);
          handleVisit();
        }}
      />

      <ErrorModal
        visible={duplicateVisitMessage !== null}
        title="방문을 시작할 수 없어요"
        description={duplicateVisitMessage ?? undefined}
        onCancel={() => setDuplicateVisitMessage(null)}
        onRetry={() => setDuplicateVisitMessage(null)}
      />

      <LocationProblemModal problem={locationProblem} purpose="visit" onClose={() => setLocationProblem(null)} />
      <LocationProblemModal problem={mapLocationProblem} purpose="map" onClose={() => setMapLocationProblem(null)} />
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
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray.gray00,
  },
  notFoundText: {
    color: Colors.gray.gray60,
  },
});
