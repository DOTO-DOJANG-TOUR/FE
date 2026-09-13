import { isRetryableError, NetworkOfflineError } from '@/apis/client';
import { getMyStampTour } from '@/apis/stamp';
import { AlertModal } from '@/components/common/AlertModal';
import { ErrorModal } from '@/components/common/ErrorModal';
import { TOUR_SHEET_HEIGHT, TourBottomSheet } from '@/components/tour/TourBottomSheet';
import { TourMap, type TourMapHandle, type TourMapMarker } from '@/components/tour/TourMap';
import { Colors, FontFamily, FontSize, Radius } from '@/constants/theme';
import { mapTourCategory } from '@/constants/tourCategory';
import { TourColors, TourTypography } from '@/constants/tourTheme';
import { useCurrentLocation } from '@/hooks/use-current-location';
import type { StampTourDetail, TourAttraction, TourFilterCategory } from '@/types/tour';
import { parseDistanceMeters, selectNearbySpots, type GeoPoint } from '@/utils/geo';
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

  const mapRef = useRef<TourMapHandle>(null);
  const {
    coords: userLocation,
    permission: locationPermission,
    canAskAgain: locationCanAskAgain,
    requestLocation,
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

  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const locationDeniedVisible =
    locationPermission === 'denied' && !locationCanAskAgain && !locationDeniedDismissed;

  const festivalId = stampTour?.festivalId;

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
      {isLoading || !stampTour ? (
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
