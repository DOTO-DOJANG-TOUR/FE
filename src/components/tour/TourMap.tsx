import { SearchIcon } from '@/components/icons/SearchIcon';
import { TOUR_CATEGORY_MARKER_LABEL } from '@/constants/tourCategory';
import { Colors, FontFamily, FontSize, Radius } from '@/constants/theme';
import { TourColors } from '@/constants/tourTheme';
import type { TourCategory } from '@/types/tour';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import WebView, { type WebViewMessageEvent } from 'react-native-webview';
import { getKakaoMapHtml } from './kakaoMapHtml';
import { CurrentLocationIcon } from './TourIcons';

const KAKAO_JAVASCRIPT_KEY = process.env.EXPO_PUBLIC_KAKAO_JAVASCRIPT_KEY;
const DEFAULT_MARKER_FOCUS_LEVEL = 3;

export type TourMapMarker = {
  id: string;
  category: TourCategory;
  lat: number;
  lng: number;
};

export type TourMapHandle = {
  focusOnBounds: (points: { lat: number; lng: number }[]) => void;
  focusOnMarker: (lat: number, lng: number, level?: number) => void;
  focusOnCurrentLocation: (lat: number, lng: number, level?: number) => void;
};

type Props = {
  markers: TourMapMarker[];
  selectedMarkerId?: string;
  currentLocation?: { lat: number; lng: number } | null;
  showLocationButton?: boolean;
  locationBottom?: number;
  onSearchPress?: () => void;
  onLocationPress?: () => void;
  onMarkerPress?: (markerId: string) => void;
};

export const TourMap = forwardRef<TourMapHandle, Props>(function TourMap(
  {
    markers,
    selectedMarkerId,
    currentLocation = null,
    showLocationButton = true,
    locationBottom = 192,
    onSearchPress,
    onLocationPress,
    onMarkerPress,
  },
  ref,
) {
  const webViewRef = useRef<WebView>(null);
  const isReadyRef = useRef(false);
  const pendingCommandsRef = useRef<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  const html = useMemo(() => getKakaoMapHtml(KAKAO_JAVASCRIPT_KEY ?? ''), []);

  const runInWebView = (js: string) => {
    if (isReadyRef.current) {
      webViewRef.current?.injectJavaScript(`${js} true;`);
      return;
    }
    pendingCommandsRef.current.push(js);
  };

  useImperativeHandle(ref, () => ({
    focusOnBounds: (points) => {
      if (points.length === 0) return;
      runInWebView(`window.__dotoMap.fitBounds(${JSON.stringify(points)});`);
    },
    focusOnMarker: (lat, lng, level = DEFAULT_MARKER_FOCUS_LEVEL) => {
      runInWebView(`window.__dotoMap.setCenter(${lat}, ${lng}, ${level});`);
    },
    focusOnCurrentLocation: (lat, lng, level) => {
      const levelArg = typeof level === 'number' ? level : 'undefined';
      runInWebView(`window.__dotoMap.setCenter(${lat}, ${lng}, ${levelArg});`);
    },
  }));

  const markerPayload = useMemo(
    () =>
      markers.map((marker) => ({
        id: marker.id,
        lat: marker.lat,
        lng: marker.lng,
        label: TOUR_CATEGORY_MARKER_LABEL[marker.category],
        selected: marker.id === selectedMarkerId,
      })),
    [markers, selectedMarkerId],
  );

  useEffect(() => {
    runInWebView(`window.__dotoMap.setMarkers(${JSON.stringify(markerPayload)});`);
  }, [markerPayload, isReady]);

  useEffect(() => {
    runInWebView(`window.__dotoMap.setCurrentLocation(${JSON.stringify(currentLocation)});`);
  }, [currentLocation, isReady]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      if (message.type === 'ready') {
        isReadyRef.current = true;
        setIsReady(true);

        pendingCommandsRef.current.forEach((js) => {
          webViewRef.current?.injectJavaScript(`${js} true;`);
        });
        pendingCommandsRef.current = [];
        return;
      }

      if (message.type === 'markerPress') {
        onMarkerPress?.(message.id);
        return;
      }

      if (message.type === 'error') {
        console.error('[TourMap] WebView error:', message.message);
      }
    } catch (error) {
      console.error('[TourMap] 메시지 파싱 실패:', error);
    }
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <WebView
        ref={webViewRef}
        style={StyleSheet.absoluteFill}
        source={{ html, baseUrl: 'http://localhost' }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        onMessage={handleMessage}
      />

      {!isReady && (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.loadingOverlay]}>
          <ActivityIndicator color={Colors.pink.pink50} />
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

      {showLocationButton && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="내 위치로 이동"
          style={[styles.locationButton, { bottom: locationBottom }]}
          onPress={onLocationPress}
        >
          <CurrentLocationIcon />
        </Pressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  loadingOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray.gray20,
  },
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
    boxShadow: TourColors.searchShadow,
  },
  searchPlaceholder: {
    color: Colors.gray.gray60,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
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
    boxShadow: TourColors.locationShadow,
  },
});
