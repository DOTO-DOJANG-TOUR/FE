import { getLocationPermissionProblem, type LocationProblem } from '@/utils/locationPolicy';
import * as Location from 'expo-location';
import { useCallback, useRef, useState } from 'react';

export type LocationPermissionState = 'granted' | 'denied' | 'undetermined';
export type RequestLocationResult = {
  coords: { lat: number; lng: number } | null;
  permission: LocationPermissionState;
  canAskAgain: boolean;
  problem: LocationProblem | null;
};

const initialState: RequestLocationResult = {
  coords: null, permission: 'undetermined', canAskAgain: true, problem: null,
};

export function useCurrentLocation() {
  const [state, setState] = useState({ ...initialState, isLoading: false });
  const requestIdRef = useRef(0);

  const resolve = useCallback(async (requestPermission: boolean): Promise<RequestLocationResult> => {
    const requestId = ++requestIdRef.current;
    setState((prev) => ({ ...prev, isLoading: true }));
    let result: RequestLocationResult = { ...initialState, problem: 'unavailable' };
    try {
      let permission = await Location.getForegroundPermissionsAsync();
      if (requestPermission && permission.status !== 'granted' && permission.canAskAgain) {
        permission = await Location.requestForegroundPermissionsAsync();
      }
      result = {
        coords: null, permission: permission.status, canAskAgain: permission.canAskAgain,
        problem: getLocationPermissionProblem(permission),
      };
      if (result.problem) return result;
      if (!(await Location.hasServicesEnabledAsync())) {
        result.problem = 'unavailable';
        return result;
      }
      let timeout: ReturnType<typeof setTimeout> | undefined;
      const position = await Promise.race([Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        // 화면 진입만으로 OS의 위치 서비스 대화상자가 뜨지 않도록 한다.
        mayShowUserSettingsDialog: requestPermission,
      }), new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error('Location timeout')), 15000);
      })]).finally(() => clearTimeout(timeout));
      result.coords = { lat: position.coords.latitude, lng: position.coords.longitude };
      return result;
    } catch {
      result.problem = 'unavailable';
      return result;
    } finally {
      if (requestIdRef.current === requestId) setState({ ...result, isLoading: false });
    }
  }, []);

  const requestLocation = useCallback(() => resolve(true), [resolve]);
  const checkLocation = useCallback(() => resolve(false), [resolve]);
  return { ...state, requestLocation, checkLocation };
}
