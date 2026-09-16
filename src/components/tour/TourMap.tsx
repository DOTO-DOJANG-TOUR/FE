import { TourAsset } from './TourAsset';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { useDelayedLoading } from '@/hooks/use-delayed-loading';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontFamily, FontSize, Radius } from '@/constants/theme';
import { TourColors } from '@/constants/tourTheme';
import type { TourCategory } from '@/types/tour';
import {
  forwardRef,
  type ComponentProps,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import WebView, { type WebViewMessageEvent } from 'react-native-webview';
import { getKakaoMapHtml } from './kakaoMapHtml';
import { CurrentLocationIcon } from './TourIcons';

const KAKAO_JAVASCRIPT_KEY = process.env.EXPO_PUBLIC_KAKAO_JAVASCRIPT_KEY;
const DEFAULT_MARKER_FOCUS_LEVEL = 3;
// SDK 스크립트 자체가 네트워크 레벨에서 조용히 실패하면(에러 이벤트도 못 잡는 경우가 있음)
// ready도 error도 영영 안 와서 로딩 스피너가 무한히 떠 있을 수 있다 — 그걸 막기 위한 타임아웃.
const MAP_READY_TIMEOUT_MS = 10000;

export type TourMapMarker = {
  // 클릭 시 이동할 대표 관광지 id(좌표가 겹치는 그룹이면 그중 첫 번째).
  id: string;
  // 이 좌표에 겹쳐있는 모든 관광지 id — 상세 화면에서 이 중 하나가 선택돼 있으면 마커가 선택 상태로 보인다.
  memberIds: string[];
  categories: TourCategory[];
  lat: number;
  lng: number;
};

export type TourMapHandle = {
  focusOnBounds: (points: { lat: number; lng: number }[]) => void;
  focusOnMarker: (lat: number, lng: number, level?: number, animate?: boolean) => void;
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

type WebViewProps = ComponentProps<typeof WebView>;

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
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const isReadyRef = useRef(false);
  const lastLoadStageRef = useRef('not-started');
  const pendingCommandsRef = useRef<string[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  const showLoading = useDelayedLoading(!isReady && !loadError);

  const html = useMemo(() => getKakaoMapHtml(KAKAO_JAVASCRIPT_KEY ?? ''), []);
  const webViewSource = useMemo(() => ({ html, baseUrl: 'http://localhost' }), [html]);

  useEffect(() => {
    if (isReady || loadError) return;

    const timer = setTimeout(() => {
      console.error(`[TourMap] 지도 준비 시간 초과 (lastStage=${lastLoadStageRef.current})`);
      setLoadError(true);
    }, MAP_READY_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [loadAttempt, isReady, loadError]);

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
    focusOnMarker: (lat, lng, level = DEFAULT_MARKER_FOCUS_LEVEL, animate = true) => {
      runInWebView(`window.__dotoMap.setCenter(${lat}, ${lng}, ${level}, ${animate});`);
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
        categories: marker.categories,
        selected: !!selectedMarkerId && marker.memberIds.includes(selectedMarkerId),
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
        lastLoadStageRef.current = 'ready';
        isReadyRef.current = true;
        setIsReady(true);

        pendingCommandsRef.current.forEach((js) => {
          webViewRef.current?.injectJavaScript(`${js} true;`);
        });
        pendingCommandsRef.current = [];
        return;
      }

      if (message.type === 'stage') {
        lastLoadStageRef.current = message.stage;
        console.info(`[TourMap] WebView stage: ${message.stage}`);
        return;
      }

      if (message.type === 'markerPress') {
        onMarkerPress?.(message.id);
        return;
      }

      if (message.type === 'error') {
        console.error('[TourMap] WebView SDK error');
        // SDK 로드 실패 등으로 ready가 영영 오지 않으면 로딩 스피너가 계속 떠 있게 되므로,
        // 에러 상태로 전환해 재시도 UI를 보여준다.
        setLoadError(true);
      }
    } catch {
      console.error('[TourMap] 메시지 파싱 실패');
    }
  };

  const handleRetry = () => {
    setLoadError(false);
    isReadyRef.current = false;
    lastLoadStageRef.current = 'retrying';
    pendingCommandsRef.current = [];
    setIsReady(false);
    setLoadAttempt((prev) => prev + 1);
  };

  const handleLoadStart: NonNullable<WebViewProps['onLoadStart']> = () => {
    lastLoadStageRef.current = 'document-loading';
  };
  const handleWebViewError: NonNullable<WebViewProps['onError']> = () => {
    lastLoadStageRef.current = 'document-error';
    setLoadError(true);
  };
  const handleHttpError: NonNullable<WebViewProps['onHttpError']> = () => {
    setLoadError(true);
  };

  const handleRenderProcessGone: NonNullable<WebViewProps['onRenderProcessGone']> = (event) => {
    lastLoadStageRef.current = 'render-process-gone';
    console.error(`[TourMap] WebView render process terminated (didCrash=${event.nativeEvent.didCrash})`);
    setLoadError(true);
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <WebView
        key={loadAttempt}
        ref={webViewRef}
        style={StyleSheet.absoluteFill}
        source={webViewSource}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        onLoadStart={handleLoadStart}
        onError={handleWebViewError}
        onHttpError={handleHttpError}
        onRenderProcessGone={handleRenderProcessGone}
        onMessage={handleMessage}
      />

      {loadError ? (
        <View style={[StyleSheet.absoluteFill, styles.loadingOverlay]}>
          <Text style={styles.errorText}>지도를 불러오지 못했어요</Text>
          <Pressable accessibilityRole="button" style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </Pressable>
        </View>
      ) : (
        showLoading && (
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.loadingOverlay]}>
            <LoadingIndicator />
          </View>
        )
      )}

      <View style={[styles.searchRow, { top: insets.top + 20 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="관광지 검색"
          style={styles.searchBar}
          onPress={onSearchPress}
        >
          <TourAsset name="search" />
          <Text numberOfLines={1} style={styles.searchPlaceholder}>방문하고 싶은 관광지 검색</Text>
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
    gap: 12,
    backgroundColor: Colors.gray.gray20,
  },
  errorText: {
    color: Colors.gray.gray70,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.medium,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.pink.pink50,
  },
  retryButtonText: {
    color: Colors.gray.gray00,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.medium,
  },
  searchRow: {
    position: 'absolute',
    top: 48,
    left: 20,
    right: 20,
  },
  searchBar: {
    height: 44,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 10,
    paddingRight: 20,
    borderRadius: 20,
    backgroundColor: Colors.gray.gray00,
    boxShadow: TourColors.searchShadow,
  },
  searchPlaceholder: {
    color: Colors.gray.gray70,
    fontSize: FontSize.md,
    lineHeight: 24,
    fontFamily: FontFamily.medium,
    flex: 1,
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
