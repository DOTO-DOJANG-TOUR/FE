import * as Location from 'expo-location';
import { useCallback, useState } from 'react';

export type LocationPermissionState = 'granted' | 'denied' | 'undetermined';

type CurrentLocationState = {
  coords: { lat: number; lng: number } | null;
  permission: LocationPermissionState;
  // 거부 후 OS 설정 화면으로 안내해야 하는지(iOS/Android 모두 재요청 불가 시 false) — #37 "권한 거부 시 안내" 대응.
  canAskAgain: boolean;
  isLoading: boolean;
};

export function useCurrentLocation() {
  const [state, setState] = useState<CurrentLocationState>({
    coords: null,
    permission: 'undetermined',
    canAskAgain: true,
    isLoading: false,
  });

  const requestLocation = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setState({ coords: null, permission: 'denied', canAskAgain, isLoading: false });
        return null;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      setState({ coords, permission: 'granted', canAskAgain: true, isLoading: false });
      return coords;
    } catch (error) {
      console.error('현재 위치 조회 실패:', error);
      setState((prev) => ({ ...prev, isLoading: false }));
      return null;
    }
  }, []);

  return { ...state, requestLocation };
}
