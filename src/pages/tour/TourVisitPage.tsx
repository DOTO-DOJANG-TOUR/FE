import { isRetryableError, NetworkOfflineError } from '@/apis/client';
import { getTourSpotDetail, getTourSpots } from '@/apis/tour';
import { ErrorModal } from '@/components/common/ErrorModal';
import { MarkerGroupPicker, type MarkerGroupOption } from '@/components/tour/MarkerGroupPicker';
import {
  TOUR_DETAIL_SHEET_HEIGHT,
  TourDetailBottomSheet,
} from '@/components/tour/TourDetailBottomSheet';
import { TourMap, type TourMapHandle, type TourMapMarker } from '@/components/tour/TourMap';
import { Colors } from '@/constants/theme';
import { mapTourCategory } from '@/constants/tourCategory';
import { useDelayedLoading } from '@/hooks/use-delayed-loading';
import type { TourAttraction, TourCategory, TourContent, TourSpotDetail } from '@/types/tour';
import { groupByCoordinate, type GeoPoint } from '@/utils/geo';
import { getCachedTourSpot, setCachedTourSpot } from '@/utils/tourSpotCache';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

export default function TourVisitPage() {
  const router = useRouter();
  const { height: screenHeight } = useWindowDimensions();
  const { attractionId, festivalId, visited: visitedParam } = useLocalSearchParams<{
    attractionId?: string;
    festivalId?: string;
    visited?: string;
  }>();

  const [expanded, setExpanded] = useState(true);
  const [visited, setVisited] = useState(visitedParam === '1');
  // 투어 메인 화면에서 이동하기 전에 미리 받아둔 데이터가 있으면(#37, tourSpotCache 참고)
  // 첫 렌더부터 바로 써서 로딩 화면 자체를 건너뛴다.
  const initialCached =
    festivalId && attractionId ? getCachedTourSpot(festivalId, attractionId) : undefined;
  const [detail, setDetail] = useState<TourSpotDetail | null>(initialCached?.detail ?? null);
  const [spots, setSpots] = useState<TourContent[]>(initialCached?.spots ?? []);
  const [isLoading, setIsLoading] = useState(
    () => !!festivalId && !!attractionId && !initialCached,
  );
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [failedRequest, setFailedRequest] = useState<{
    retry: () => void;
    isOffline: boolean;
  } | null>(null);
  const [groupPickerOptions, setGroupPickerOptions] = useState<MarkerGroupOption[] | null>(null);

  const mapRef = useRef<TourMapHandle>(null);
  // 응답이 빨리 오면 스피너를 아예 안 띄워서 화면 전환이 반짝이지 않게 한다.
  const showLoadingIndicator = useDelayedLoading(isLoading);

  // 지도에서 다른 마커를 눌러 attractionId가 바뀌면(같은 화면 인스턴스가 재사용됨) 이전 관광지의
  // visited/expanded 상태가 남아있지 않도록 렌더 중에 리셋한다(React 공식 "Adjusting state on prop
  // change" 패턴 — useEffect로 하면 set-state-in-effect 린트에 걸리고 한 프레임 늦게 반영된다).
  const [prevAttractionId, setPrevAttractionId] = useState(attractionId);
  if (attractionId !== prevAttractionId) {
    setPrevAttractionId(attractionId);
    // visitedParam은 최초 진입 시점의 값이라 다른 관광지로 전환할 때 그대로 쓰면 안 된다.
    // 전환된 관광지의 방문 여부를 별도로 조회하지 않으므로 일단 false로 초기화한다.
    setVisited(false);
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
    // detail이 이미 이 attractionId 것이면(프리페치·캐시로 위에서 채워짐) 다시 받아올 필요 없다.
    if (detail?.tourSpotId === attractionId) return;

    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [spotDetail, allSpots] = await Promise.all([
          getTourSpotDetail(festivalId, attractionId),
          getTourSpots(festivalId),
        ]);

        if (isMounted) {
          setDetail(spotDetail);
          setSpots(allSpots);
          setCachedTourSpot(festivalId, attractionId, { detail: spotDetail, spots: allSpots });
        }
      } catch (error) {
        console.error('관광지 상세 조회 실패:', error);
        if (isMounted) {
          // 전환 실패 시 이전 관광지 내용을 그대로 유지하면 URL·선택 마커는 새 관광지를
          // 가리키는데 상세 시트는 이전 관광지를 보여주는 상태가 된다 — 이전 관광지로
          // 되돌려서 화면 전체가 다시 일치하게 한다.
          if (detail && detail.tourSpotId !== attractionId) {
            router.setParams({ attractionId: detail.tourSpotId });
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
  }, [festivalId, attractionId, reloadTrigger, detail, router]);

  const attraction = useMemo<TourAttraction | null>(() => {
    if (!detail) return null;

    const category = mapTourCategory(detail.category);
    if (!category) return null;

    return {
      id: detail.tourSpotId,
      title: detail.title,
      address: detail.address,
      category,
      // 상세 화면(TourDetailBottomSheet)엔 거리를 보여주는 UI가 없어 계산하지 않는다.
      distance: '',
      imageUrls: detail.imageList,
      phone: detail.phone,
    };
  }, [detail]);

  // 좌표가 같은(주소가 같은) 관광지가 여러 개면 마커 하나에 아이콘을 나란히 묶어서 보여준다(#37).
  const markers = useMemo<TourMapMarker[]>(() => {
    const validSpots = spots
      .map((spot) => {
        const category = mapTourCategory(spot.category);
        const point: GeoPoint = { lat: Number(spot.mapY), lng: Number(spot.mapX) };

        if (!category || !Number.isFinite(point.lat) || !Number.isFinite(point.lng)) return null;

        return { id: spot.tourSpotId, category, point };
      })
      .filter(
        (item): item is { id: string; category: TourCategory; point: GeoPoint } => item !== null,
      );

    return groupByCoordinate(validSpots, (item) => item.point).map((group) => ({
      id: group.items[0].id,
      memberIds: group.items.map((item) => item.id),
      categories: group.items.map((item) => item.category),
      lat: group.lat,
      lng: group.lng,
    }));
  }, [spots]);

  // 화면에 처음 들어왔을 때만(애니메이션 없이) 선택된 관광지 위치에 자리 잡는다. 이미 들어와 있는
  // 상태에서 다른 마커를 눌렀을 때의 부드러운 이동은 navigateToAttraction이 클릭 즉시 처리하므로,
  // 여기서 또 움직이면 안 된다(한 번만 실행되도록 ref로 막음, #37).
  const hasFocusedInitiallyRef = useRef(false);
  useEffect(() => {
    if (!detail || hasFocusedInitiallyRef.current) return;

    const lat = Number(detail.mapY);
    const lng = Number(detail.mapX);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    hasFocusedInitiallyRef.current = true;
    // 권장 줌 레벨 3, 애니메이션 없이 즉시 배치(#37).
    mapRef.current?.focusOnMarker(lat, lng, undefined, false);
  }, [detail]);

  const navigateToAttraction = (targetId: string) => {
    if (targetId === attractionId) return;

    // 상세 데이터(전화번호 등)를 기다리지 않고, 이미 갖고 있는 좌표로 지도부터 바로 부드럽게 이동시킨다.
    // 상세 정보는 뒤에서 이어서 불러오고, 화면은 이전 관광지 내용을 유지하다가 도착하면 자연스럽게
    // 바뀐다(로딩 화면으로 깜빡이지 않는다, #37).
    const target = spots.find((spot) => spot.tourSpotId === targetId);
    const lat = target ? Number(target.mapY) : NaN;
    const lng = target ? Number(target.mapX) : NaN;
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      mapRef.current?.focusOnMarker(lat, lng);
    }

    // push/replace 둘 다 화면(과 그 안의 지도 WebView)을 통째로 재마운트시켜서 전환마다
    // 지도가 처음부터 다시 로드되며 흰 화면이 깜빡였다 — setParams는 같은 화면 인스턴스를 유지한
    // 채 파라미터만 바꿔서 지도가 다시 로드되지 않는다(#37).
    router.setParams({ attractionId: targetId });
  };

  const handleMarkerPress = (markerId: string) => {
    const group = markers.find((marker) => marker.id === markerId);
    if (!group) return;

    if (group.memberIds.length <= 1) {
      navigateToAttraction(markerId);
      return;
    }

    // 좌표가 겹쳐 마커 하나로 합쳐진 경우 어디로 갈지 고르게 한다(#37).
    const options = group.memberIds
      .map((id) => {
        const spot = spots.find((item) => item.tourSpotId === id);
        if (!spot) return null;
        const category = mapTourCategory(spot.category);
        if (!category) return null;
        return { id: spot.tourSpotId, title: spot.title, category };
      })
      .filter((option): option is MarkerGroupOption => option !== null);

    setGroupPickerOptions(options);
  };

  const handleGroupPickerSelect = (targetId: string) => {
    setGroupPickerOptions(null);
    navigateToAttraction(targetId);
  };

  if (!isLoading && !attraction) {
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
          {showLoadingIndicator && <ActivityIndicator color={Colors.pink.pink50} />}
        </View>
      ) : (
        <>
          <TourMap
            ref={mapRef}
            markers={markers}
            selectedMarkerId={attractionId}
            showLocationButton={false}
            locationBottom={
              expanded
                ? Math.min(600, screenHeight - 196) + 20
                : TOUR_DETAIL_SHEET_HEIGHT.collapsed + 20
            }
            onSearchPress={() => router.push({ pathname: '/search/tour', params: { festivalId } })}
            onMarkerPress={handleMarkerPress}
          />
          <TourDetailBottomSheet
            attraction={attraction}
            expanded={expanded}
            visited={visited}
            onClose={() => router.back()}
            onExpandedChange={setExpanded}
            onVisited={() => setVisited(true)}
          />
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
