import type { LocationPermissionResponse } from 'expo-location';

export type LocationProblem = 'denied' | 'blocked' | 'approximate' | 'unavailable';

export function getLocationPermissionProblem(permission: LocationPermissionResponse): LocationProblem | null {
  if (permission.status !== 'granted') return permission.canAskAgain ? 'denied' : 'blocked';
  if (permission.android?.accuracy === 'coarse' || permission.ios?.accuracy === 'reduced') {
    return 'approximate';
  }
  return null;
}
