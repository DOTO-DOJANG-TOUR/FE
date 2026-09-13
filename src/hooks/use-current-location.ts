import * as Location from 'expo-location';
import { useCallback, useState } from 'react';

export type LocationPermissionState = 'granted' | 'denied' | 'undetermined';

type RequestLocationResult = {
  coords: { lat: number; lng: number } | null;
  permission: LocationPermissionState;
  // 거부 후 OS 설정 화면으로 안내해야 하는지(iOS/Android 모두 재요청 불가 시 false) — #37 "권한 거부 시 안내" 대응.
  canAskAgain: boolean;
};

type CurrentLocationState = RequestLocationResult & { isLoading: boolean };

export function useCurrentLocation() {
  const [state, setState] = useState<CurrentLocationState>({
    coords: null,
    permission: 'undetermined',
    canAskAgain: true,
    isLoading: false,
  });

  // 호출부가 곧바로 결과를 쓸 수 있도록 state뿐 아니라 결과 객체도 반환한다(setState는 비동기라
  // 호출 직후 state를 읽으면 값이 최신이 아닐 수 있음).
  const requestLocation = useCallback(async (): Promise<RequestLocationResult> => {
    setState((prev) => ({ ...prev, isLoading: true }));

    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      const result: RequestLocationResult = { coords: null, permission: 'denied', canAskAgain };
      setState({ ...result, isLoading: false });
      return result;
    }

    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const result: RequestLocationResult = {
        coords: { lat: position.coords.latitude, lng: position.coords.longitude },
        permission: 'granted',
        canAskAgain: true,
      };
      setState({ ...result, isLoading: false });
      return result;
    } catch (error) {
      // 권한은 허용됐지만(status === 'granted') 기기 위치 서비스 자체가 꺼져 있는 등
      // 일시적으로 좌표를 못 가져오는 흔한 케이스라 console.error(LogBox 전체화면 에러)는 피한다.
      console.warn('현재 위치 조회 실패:', error);
      const result: RequestLocationResult = { coords: null, permission: 'granted', canAskAgain: true };
      setState({ ...result, isLoading: false });
      return result;
    }
  }, []);

  return { ...state, requestLocation };
}
