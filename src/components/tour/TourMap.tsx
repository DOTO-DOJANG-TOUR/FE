import { SearchIcon } from '@/components/icons/SearchIcon';
import { Colors, FontFamily, Radius } from '@/constants/theme';
import type { TourCategory } from '@/types/tour';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CheckerPlaceholder } from './CheckerPlaceholder';
import { CurrentLocationIcon } from './TourIcons';

type Props = {
  selectedCategory?: TourCategory | 'menu';
  selectedMarkerId?: string;
  showCurrentLocation?: boolean;
  locationBottom?: number;
  onSearchPress?: () => void;
  onLocationPress?: () => void;
  onMarkerPress?: (markerId: string) => void;
};

const markerData: {
  id: string;
  category: TourCategory;
  label: string;
  left: `${number}%`;
  top: `${number}%`;
}[] = [
  { id: 'dolsan-park', category: 'culture', label: '문', left: '27%', top: '18%' },
  { id: 'aqua-planet', category: 'culture', label: '문', left: '67%', top: '14%' },
  { id: 'history-1', category: 'history', label: '역', left: '48%', top: '34%' },
  { id: 'isunsin-square', category: 'history', label: '역', left: '44%', top: '48%' },
  { id: 'odongdo', category: 'nature', label: '자', left: '20%', top: '61%' },
  { id: 'nature-2', category: 'nature', label: '자', left: '69%', top: '56%' },
  { id: 'experience-1', category: 'experience', label: '체', left: '34%', top: '75%' },
  { id: 'experience-2', category: 'experience', label: '체', left: '73%', top: '72%' },
];

export function TourMap({
  selectedCategory = 'menu',
  selectedMarkerId,
  showCurrentLocation = false,
  locationBottom = 192,
  onSearchPress,
  onLocationPress,
  onMarkerPress,
}: Props) {
  const visibleMarkers = markerData.filter(
    (marker) => selectedCategory === 'menu' || marker.category === selectedCategory,
  );

  return (
    <View style={StyleSheet.absoluteFill}>
      <CheckerPlaceholder style={StyleSheet.absoluteFill} />

      {visibleMarkers.map((marker) => {
        const selected = marker.id === selectedMarkerId;

        return (
          <Pressable
            key={marker.id}
            accessibilityRole="button"
            accessibilityLabel={`${marker.label} 관광지 상세 보기`}
            style={[styles.markerPosition, { left: marker.left, top: marker.top }]}
            onPress={() => onMarkerPress?.(marker.id)}
          >
            <View style={[styles.marker, selected && styles.selectedMarker]}>
              <Text style={[styles.markerText, selected && styles.selectedMarkerText]}>
                {marker.label}
              </Text>
            </View>
            <View style={[styles.markerTail, selected && styles.selectedMarkerTail]} />
          </Pressable>
        );
      })}

      {showCurrentLocation && (
        <View pointerEvents="none" style={styles.currentLocationMarker}>
          <View style={styles.currentLocationPulse} />
          <View style={styles.currentLocationDot} />
        </View>
      )}

      <View style={styles.searchRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="관광지 검색"
          style={styles.searchBar}
          onPress={onSearchPress}
        >
          <SearchIcon size={20} />
          <Text style={styles.searchPlaceholder}>방문하고 싶은 관광지 검색</Text>
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="내 위치로 이동"
        style={[styles.locationButton, { bottom: locationBottom }]}
        onPress={onLocationPress}
      >
        <CurrentLocationIcon />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    position: 'absolute',
    top: 48,
    left: 20,
    right: 20,
  },
  searchBar: {
    height: 48,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 16,
    borderRadius: Radius.full,
    backgroundColor: Colors.gray.gray00,
    boxShadow: '0 2px 8px rgba(38, 38, 38, 0.08)',
  },
  searchPlaceholder: {
    color: Colors.gray.gray60,
    fontSize: 14,
    fontFamily: FontFamily.regular,
  },
  markerPosition: {
    position: 'absolute',
    width: 30,
    height: 34,
    alignItems: 'center',
  },
  marker: {
    zIndex: 2,
    width: 25,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    borderWidth: 3,
    borderColor: Colors.pink.pink30,
    backgroundColor: Colors.gray.gray00,
  },
  selectedMarker: {
    width: 34,
    height: 34,
    borderWidth: 4,
    backgroundColor: Colors.pink.pink50,
  },
  markerText: {
    color: Colors.pink.pink40,
    fontSize: 9,
    fontFamily: FontFamily.bold,
  },
  selectedMarkerText: {
    color: Colors.gray.gray00,
    fontSize: 12,
  },
  markerTail: {
    width: 8,
    height: 8,
    marginTop: -5,
    transform: [{ rotate: '45deg' }],
    backgroundColor: Colors.pink.pink30,
  },
  selectedMarkerTail: {
    width: 10,
    height: 10,
    marginTop: -6,
    backgroundColor: Colors.pink.pink50,
  },
  currentLocationMarker: {
    position: 'absolute',
    left: '49%',
    top: '59%',
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationPulse: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(53, 139, 255, 0.16)',
  },
  currentLocationDot: {
    width: 16,
    height: 16,
    borderWidth: 3,
    borderColor: Colors.gray.gray00,
    borderRadius: Radius.full,
    backgroundColor: '#358BFF',
  },
  locationButton: {
    position: 'absolute',
    right: 20,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    backgroundColor: Colors.gray.gray00,
    boxShadow: '0 2px 8px rgba(38, 38, 38, 0.14)',
  },
});
