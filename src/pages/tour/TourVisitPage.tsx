import {
  TOUR_DETAIL_SHEET_HEIGHT,
  TourDetailBottomSheet,
} from '@/components/tour/TourDetailBottomSheet';
import { TourMap } from '@/components/tour/TourMap';
import { TOUR_ATTRACTIONS } from '@/constants/tourMockData';
import { Colors } from '@/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

export default function TourVisitPage() {
  const router = useRouter();
  const { height: screenHeight } = useWindowDimensions();
  const { attractionId, visited: visitedParam } = useLocalSearchParams<{
    attractionId?: string;
    visited?: string;
  }>();
  const attraction = TOUR_ATTRACTIONS.find((item) => item.id === attractionId);
  const [expanded, setExpanded] = useState(true);
  const [visited, setVisited] = useState(
    visitedParam === '1' || attraction?.visited === true,
  );

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
        onVisited={() => setVisited(true)}
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
