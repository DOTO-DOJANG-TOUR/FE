import * as Location from 'expo-location';
import { useCallback, useState } from 'react';

export type CurrentLocationStatus = 'idle' | 'requesting' | 'denied' | 'error';

type Coordinates = { latitude: number; longitude: number };

export function useCurrentLocation() {
  const [status, setStatus] = useState<CurrentLocationStatus>('idle');

  const requestLocation = useCallback(async (): Promise<Coordinates | null> => {
    setStatus('requesting');

    try {
      const { status: permission } = await Location.requestForegroundPermissionsAsync();
      if (permission !== 'granted') {
        setStatus('denied');
        return null;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setStatus('idle');
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch {
      setStatus('error');
      return null;
    }
  }, []);

  return { status, requestLocation };
}
