import { isRetryableError, NetworkOfflineError } from '@/apis/client';
import { getTourSpotDetail, getTourSpots } from '@/apis/tour';
import { ErrorModal } from '@/components/common/ErrorModal';
import {
  TOUR_DETAIL_SHEET_HEIGHT,
  TourDetailBottomSheet,
} from '@/components/tour/TourDetailBottomSheet';
import { TourMap, type TourMapHandle, type TourMapMarker } from '@/components/tour/TourMap';
import { Colors } from '@/constants/theme';
import { mapTourCategory } from '@/constants/tourCategory';
import type { TourAttraction, TourContent, TourSpotDetail } from '@/types/tour';
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
  const [detail, setDetail] = useState<TourSpotDetail | null>(null);
  const [spots, setSpots] = useState<TourContent[]>([]);
  const [isLoading, setIsLoading] = useState(() => !!festivalId && !!attractionId);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [failedRequest, setFailedRequest] = useState<{
    retry: () => void;
    isOffline: boolean;
  } | null>(null);

  const mapRef = useRef<TourMapHandle>(null);

  useEffect(() => {
    if (!festivalId || !attractionId) return;

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
        }
      } catch (error) {
        console.error('관광지 상세 조회 실패:', error);
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

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [festivalId, attractionId, reloadTrigger]);

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

  const markers = useMemo<TourMapMarker[]>(
    () =>
      spots
        .map((spot) => {
          const category = mapTourCategory(spot.category);
          const lat = Number(spot.mapY);
          const lng = Number(spot.mapX);

          if (!category || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;

          return { id: spot.tourSpotId, category, lat, lng };
        })
        .filter((marker): marker is TourMapMarker => marker !== null),
    [spots],
  );

  useEffect(() => {
    if (!detail) return;

    const lat = Number(detail.mapY);
    const lng = Number(detail.mapX);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    // 마커 선택 시 선택 마커 중심 · 권장 줌 레벨 3으로 이동(#37).
    mapRef.current?.focusOnMarker(lat, lng);
  }, [detail]);

  if (!isLoading && !attraction) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>관광지 정보를 찾을 수 없어요.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading || !attraction ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.pink.pink50} />
        </View>
      ) : (
        <>
          <TourMap
            ref={mapRef}
            markers={markers}
            selectedMarkerId={attraction.id}
            showLocationButton={false}
            locationBottom={
              expanded
                ? Math.min(600, screenHeight - 196) + 20
                : TOUR_DETAIL_SHEET_HEIGHT.collapsed + 20
            }
            onSearchPress={() => router.push({ pathname: '/search/tour', params: { festivalId } })}
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
