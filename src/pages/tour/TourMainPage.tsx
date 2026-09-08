import { TOUR_SHEET_HEIGHT, TourBottomSheet } from '@/components/tour/TourBottomSheet';
import { TourMap } from '@/components/tour/TourMap';
import { ACTIVE_TOUR_TITLE, TOUR_ATTRACTIONS } from '@/constants/tourMockData';
import { Colors, FontFamily, FontSize, Radius } from '@/constants/theme';
import { TourColors } from '@/constants/tourTheme';
import type { TourAttraction, TourFilterCategory } from '@/types/tour';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function TourMainPage() {
  const router = useRouter();
  const { empty } = useLocalSearchParams<{ empty?: string }>();
  const [expanded, setExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TourFilterCategory>('menu');
  const [locationCentered, setLocationCentered] = useState(false);

  const attractions = useMemo(
    () =>
      TOUR_ATTRACTIONS.filter(
        (attraction) =>
          selectedCategory === 'menu' || attraction.category === selectedCategory,
      ),
    [selectedCategory],
  );

  const handleAttractionPress = (attraction: TourAttraction) => {
    router.push({ pathname: '/visit', params: { attractionId: attraction.id } });
  };

  if (empty === '1') {
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
      <TourMap
        selectedCategory={selectedCategory}
        showCurrentLocation={locationCentered}
        locationBottom={
          expanded
            ? TOUR_SHEET_HEIGHT.expanded + 20
            : TOUR_SHEET_HEIGHT.collapsed + 20
        }
        onSearchPress={() => router.push('/search/tour')}
        onLocationPress={() => setLocationCentered(true)}
        onMarkerPress={(markerId) =>
          router.push({ pathname: '/visit', params: { attractionId: markerId } })
        }
      />

      <TourBottomSheet
        expanded={expanded}
        title={ACTIVE_TOUR_TITLE}
        stampCount={1}
        selectedCategory={selectedCategory}
        attractions={attractions}
        onExpandedChange={setExpanded}
        onCategoryChange={(category) => {
          setSelectedCategory(category);
          setExpanded(true);
        }}
        onAttractionPress={handleAttractionPress}
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
    fontSize: 13,
  },
  noTourTitle: {
    color: Colors.gray.gray70,
    fontSize: FontSize.sm,
    lineHeight: 21,
    fontFamily: FontFamily.medium,
  },
  noTourDescription: {
    color: Colors.gray.gray60,
    fontSize: FontSize.xs,
    lineHeight: 18,
    fontFamily: FontFamily.regular,
  },
});
