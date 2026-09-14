import * as Location from 'expo-location';
import { useCallback, useRef, useState } from 'react';

export type LocationPermissionState = 'granted' | 'denied' | 'undetermined';

type RequestLocationResult = {
  coords: { lat: number; lng: number } | null;
  permission: LocationPermissionState;
  // 거부 후 OS 설정 화면으로 안내해야 하는지(iOS/Android 모두 재요청 불가 시 false) — #37 "권한 거부 시 안내" 대응.
  canAskAgain: boolean;
};

type CurrentLocationState = RequestLocationResult & { isLoading: boolean };

// 권한이 이미 granted인 경우에만 실제 좌표 조회를 시도한다(요청 여부와 무관한 공통 처리).
async function resolveCurrentPosition(): Promise<RequestLocationResult> {
  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      coords: { lat: position.coords.latitude, lng: position.coords.longitude },
      permission: 'granted',
      canAskAgain: true,
    };
  } catch (error) {
    // 권한은 허용됐지만(status === 'granted') 기기 위치 서비스 자체가 꺼져 있는 등
    // 일시적으로 좌표를 못 가져오는 흔한 케이스라 console.error(LogBox 전체화면 에러)는 피한다.
    console.warn('현재 위치 조회 실패:', error);
    return { coords: null, permission: 'granted', canAskAgain: true };
  }
}

export function useCurrentLocation() {
  const [state, setState] = useState<CurrentLocationState>({
    coords: null,
    permission: 'undetermined',
    canAskAgain: true,
    isLoading: false,
  });

  // checkLocation(마운트)과 requestLocation(위치 버튼)이 거의 동시에 호출되면, 더 늦게 끝난
  // 쪽이 늦게 시작한 다른 쪽의 최신 state를 덮어쓸 수 있다 — 호출마다 증가시키는 id를 찍어두고,
  // state를 반영할 시점에 아직 최신 호출인지 확인해서 오래된 응답이 새 결과를 덮지 않게 한다.
  const requestIdRef = useRef(0);

  // 호출부가 곧바로 결과를 쓸 수 있도록 state뿐 아니라 결과 객체도 반환한다(setState는 비동기라
  // 호출 직후 state를 읽으면 값이 최신이 아닐 수 있음). 반환값은 항상 이 호출 자신의 결과이므로
  // requestId와 무관하게 그대로 돌려준다.
  const requestLocation = useCallback(async (): Promise<RequestLocationResult> => {
    const requestId = ++requestIdRef.current;
    setState((prev) => ({ ...prev, isLoading: true }));

    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      const result: RequestLocationResult = { coords: null, permission: 'denied', canAskAgain };
      if (requestIdRef.current === requestId) setState({ ...result, isLoading: false });
      return result;
    }

    const result = await resolveCurrentPosition();
    if (requestIdRef.current === requestId) setState({ ...result, isLoading: false });
    return result;
  }, []);

  // requestLocation과 달리 권한 대화상자를 띄우지 않고 현재 권한 상태만 확인한다 — 사용자
  // 조작(위치 버튼) 없이 화면 마운트만으로 권한 재요청 대화상자가 뜨는 것을 막기 위해 쓴다.
  const checkLocation = useCallback(async (): Promise<RequestLocationResult> => {
    const requestId = ++requestIdRef.current;
    setState((prev) => ({ ...prev, isLoading: true }));

    const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();

    if (status !== 'granted') {
      const result: RequestLocationResult = { coords: null, permission: 'denied', canAskAgain };
      if (requestIdRef.current === requestId) setState({ ...result, isLoading: false });
      return result;
    }

    const result = await resolveCurrentPosition();
    if (requestIdRef.current === requestId) setState({ ...result, isLoading: false });
    return result;
  }, []);

  return { ...state, requestLocation, checkLocation };
}
