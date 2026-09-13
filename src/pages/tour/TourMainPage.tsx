import { isRetryableError, NetworkOfflineError } from '@/apis/client';
import { getFestivalDetail } from '@/apis/festival';
import { getTourSpots } from '@/apis/tour';
import { AlertModal } from '@/components/common/AlertModal';
import { ErrorModal } from '@/components/common/ErrorModal';
import { TOUR_SHEET_HEIGHT, TourBottomSheet } from '@/components/tour/TourBottomSheet';
import { TourMap, type TourMapHandle, type TourMapMarker } from '@/components/tour/TourMap';
import { Colors, FontFamily, FontSize, Radius } from '@/constants/theme';
import { mapTourCategory } from '@/constants/tourCategory';
import { TourColors, TourTypography } from '@/constants/tourTheme';
import { useCurrentLocation } from '@/hooks/use-current-location';
import type { TourAttraction, TourContent, TourFilterCategory } from '@/types/tour';
import { distanceMeters, formatDistance, getCentroid, selectNearbySpots, type GeoPoint } from '@/utils/geo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native';

type AttractionWithPoint = { attraction: TourAttraction; point: GeoPoint };

export default function TourMainPage() {
  const router = useRouter();
  const { empty, festivalId } = useLocalSearchParams<{ empty?: string; festivalId?: string }>();

  const [expanded, setExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TourFilterCategory>('menu');

  const [festivalTitle, setFestivalTitle] = useState('');
  const [spots, setSpots] = useState<TourContent[]>([]);
  const [isLoading, setIsLoading] = useState(() => !!festivalId);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [failedRequest, setFailedRequest] = useState<{
    retry: () => void;
    isOffline: boolean;
  } | null>(null);
  const [locationDeniedDismissed, setLocationDeniedDismissed] = useState(false);

  const mapRef = useRef<TourMapHandle>(null);
  const {
    coords: userLocation,
    permission: locationPermission,
    canAskAgain: locationCanAskAgain,
    requestLocation,
  } = useCurrentLocation();

  useEffect(() => {
    if (!festivalId) return;

    let isMounted = true;

    const fetchTourData = async () => {
      try {
        setIsLoading(true);
        const [festival, tourSpots] = await Promise.all([
          getFestivalDetail(festivalId),
          getTourSpots(festivalId),
        ]);

        if (isMounted) {
          setFestivalTitle(festival.title);
          setSpots(tourSpots);
        }
      } catch (error) {
        console.error('투어 데이터 조회 실패:', error);
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

    fetchTourData();

    return () => {
      isMounted = false;
    };
  }, [festivalId, reloadTrigger]);

  useEffect(() => {
    if (!festivalId) return;
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [festivalId]);

  const locationDeniedVisible =
    locationPermission === 'denied' && !locationCanAskAgain && !locationDeniedDismissed;

  // 축제 좌표를 내려주는 API가 없어(docs/OPEN_QUESTIONS.md "C" 참고) 관광지 전체의 중심(centroid)을
  // 임시 기준점으로 쓴다. 백엔드가 축제 좌표를 추가해주면 이 값으로 교체한다.
  const festivalCenter = useMemo(() => {
    const points = spots
      .map((spot) => ({ lat: Number(spot.mapY), lng: Number(spot.mapX) }))
      .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng));

    return getCentroid(points);
  }, [spots]);

  const nearbySpots = useMemo(() => {
    if (!festivalCenter) return spots;

    return selectNearbySpots(spots, festivalCenter, (spot) => ({
      lat: Number(spot.mapY),
      lng: Number(spot.mapX),
    }));
  }, [spots, festivalCenter]);

  const attractionsWithPoint = useMemo<AttractionWithPoint[]>(() => {
    const mapped = nearbySpots
      .map((spot) => {
        const category = mapTourCategory(spot.category);
        const point: GeoPoint = { lat: Number(spot.mapY), lng: Number(spot.mapX) };

        if (!category || !Number.isFinite(point.lat) || !Number.isFinite(point.lng)) {
          return null;
        }

        const distance = userLocation
          ? formatDistance(distanceMeters(userLocation, point))
          : '';

        const attraction: TourAttraction = {
          id: spot.tourSpotId,
          title: spot.title,
          address: spot.address,
          category,
          distance,
          imageUrls: spot.imageUrl ? [spot.imageUrl] : [],
        };

        return { attraction, point };
      })
      .filter((item): item is AttractionWithPoint => item !== null);

    if (!userLocation) return mapped;

    return [...mapped].sort(
      (a, b) => distanceMeters(userLocation, a.point) - distanceMeters(userLocation, b.point),
    );
  }, [nearbySpots, userLocation]);

  const filteredItems = useMemo(
    () =>
      attractionsWithPoint.filter(
        (item) => selectedCategory === 'menu' || item.attraction.category === selectedCategory,
      ),
    [attractionsWithPoint, selectedCategory],
  );

  const attractions = useMemo(() => filteredItems.map((item) => item.attraction), [filteredItems]);

  const markers = useMemo<TourMapMarker[]>(
    () =>
      filteredItems.map((item) => ({
        id: item.attraction.id,
        category: item.attraction.category,
        lat: item.point.lat,
        lng: item.point.lng,
      })),
    [filteredItems],
  );

  useEffect(() => {
    if (filteredItems.length === 0) return;
    mapRef.current?.focusOnBounds(filteredItems.map((item) => item.point));
  }, [filteredItems]);

  const handleAttractionPress = (attraction: TourAttraction) => {
    router.push({ pathname: '/visit', params: { attractionId: attraction.id, festivalId } });
  };

  const handleMarkerPress = (markerId: string) => {
    router.push({ pathname: '/visit', params: { attractionId: markerId, festivalId } });
  };

  const handleLocationPress = async () => {
    const coords = userLocation ?? (await requestLocation());

    if (coords) {
      mapRef.current?.focusOnCurrentLocation(coords.lat, coords.lng);
      return;
    }

    // 이미 닫았던 안내를 다시 눌렀을 때는 재노출한다.
    setLocationDeniedDismissed(false);
  };

  if (empty === '1' || !festivalId) {
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
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.pink.pink50} />
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
            title={festivalTitle}
            // 진행 중인 도장 개수 API가 아직 없음(#48 방문 인증에서 확정 예정) — 우선 0으로 표시.
            stampCount={0}
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
