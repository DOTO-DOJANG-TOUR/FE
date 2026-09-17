import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

// 도보 이동 기준: 5m 움직이거나 3초가 지나면 먼저 온 쪽으로 갱신한다(택시 앱 기사 아이콘
// 정도의 부드러움). GPS 칩 자체가 보통 1초에 한 번 이상은 값을 못 주기 때문에 지도(WebView)
// 갱신 빈도 걱정 없이 더 촘촘하게 잡아도 된다.
const WATCH_OPTIONS = {
  accuracy: Location.Accuracy.High,
  timeInterval: 3000,
  distanceInterval: 5,
};

// 지도가 화면에 보이는 동안에만(포커스 중) 실시간으로 위치를 구독해 지도 위 '내 위치' 점이
// 실제로 걸어 다니는 대로 움직이게 한다. 권한이 이미 허용된 경우에만 조용히 구독을 시작하고
// (OS 대화상자 없음), 아직 허용 전이면 아무것도 하지 않는다 — 권한 요청 자체는 기존처럼
// '내 위치' 버튼을 눌렀을 때(useCurrentLocation의 requestLocation)만 뜬다.
export function useLiveLocationWatch() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useFocusEffect(
    useCallback(() => {
      let subscription: Location.LocationSubscription | null = null;
      let cancelled = false;

      (async () => {
        const permission = await Location.getForegroundPermissionsAsync();
        if (cancelled || permission.status !== 'granted') return;
        if (!(await Location.hasServicesEnabledAsync())) return;

        const sub = await Location.watchPositionAsync(WATCH_OPTIONS, (position) => {
          setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        });
        if (cancelled) {
          sub.remove();
          return;
        }
        subscription = sub;
      })();

      return () => {
        cancelled = true;
        subscription?.remove();
        setCoords(null);
      };
    }, []),
  );

  return coords;
}
