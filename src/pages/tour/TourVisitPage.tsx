import { ApiError } from '@/apis/client';
import { startTourSpotVisit } from '@/apis/tourVisit';
import { ErrorModal } from '@/components/common/ErrorModal';
import {
  TOUR_DETAIL_SHEET_HEIGHT,
  TourDetailBottomSheet,
} from '@/components/tour/TourDetailBottomSheet';
import { TourMap } from '@/components/tour/TourMap';
import { MOCK_FESTIVAL_ID, TOUR_ATTRACTIONS } from '@/constants/tourMockData';
import { Colors } from '@/constants/theme';
import { useTourVisitStore } from '@/stores/tourVisitStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

const DUPLICATE_VISIT_ERROR_CODES = new Set([
  'STAMP-TOUR-409-002',
  'TOUR-SPOT-VISIT-409-001',
  'STAMP-409-001',
]);

export default function TourVisitPage() {
  const router = useRouter();
  const { height: screenHeight } = useWindowDimensions();
  const { attractionId, visited: visitedParam } = useLocalSearchParams<{
    attractionId?: string;
    visited?: string;
  }>();
  const attraction = TOUR_ATTRACTIONS.find((item) => item.id === attractionId);
  const [expanded, setExpanded] = useState(true);
  const visited = visitedParam === '1' || attraction?.visited === true;
  const [retryVisible, setRetryVisible] = useState(false);
  const [duplicateVisitMessage, setDuplicateVisitMessage] = useState<string | null>(null);

  const handleVisit = async () => {
    if (!attraction) return;

    try {
      const response = await startTourSpotVisit(MOCK_FESTIVAL_ID, attraction.id);
      await useTourVisitStore.getState().start({
        festivalId: MOCK_FESTIVAL_ID,
        tourSpotId: response.tourSpotId,
        tourSpotName: response.tourSpotName,
        expiresAt: response.expiresAt,
      });
      router.push('/check-in');
    } catch (error) {
      if (error instanceof ApiError && DUPLICATE_VISIT_ERROR_CODES.has(error.code ?? '')) {
        setDuplicateVisitMessage(error.message);
        return;
      }
      setRetryVisible(true);
    }
  };

  if (!attraction) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>관광지 정보를 찾을 수 없어요.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TourMap
        selectedMarkerId={attraction.id}
        showLocationButton={false}
        locationBottom={
          expanded
            ? Math.min(600, screenHeight - 196) + 20
            : TOUR_DETAIL_SHEET_HEIGHT.collapsed + 20
        }
        onSearchPress={() => router.push('/search/tour')}
      />
      <TourDetailBottomSheet
        attraction={attraction}
        expanded={expanded}
        visited={visited}
        onClose={() => router.back()}
        onExpandedChange={setExpanded}
        onVisited={handleVisit}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
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
