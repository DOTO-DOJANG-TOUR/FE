import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  AUTH_USER: 'authUser',
} as const;

export const TOKEN_KEYS = {
  ACCESS_TOKEN: STORAGE_KEYS.ACCESS_TOKEN,
  REFRESH_TOKEN: STORAGE_KEYS.REFRESH_TOKEN,
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
export type TokenKey = (typeof TOKEN_KEYS)[keyof typeof TOKEN_KEYS];

const webStorage = new Map<StorageKey, string>();

export function getStorageItem(key: StorageKey) {
  if (Platform.OS === 'web') {
    return Promise.resolve(webStorage.get(key) ?? null);
  }

  return SecureStore.getItemAsync(key);
}

export function setStorageItem(key: StorageKey, value: string) {
  if (Platform.OS === 'web') {
    webStorage.set(key, value);
    return Promise.resolve();
  }

  return SecureStore.setItemAsync(key, value);
}

export function deleteStorageItem(key: StorageKey) {
  if (Platform.OS === 'web') {
    webStorage.delete(key);
    return Promise.resolve();
  }

  return SecureStore.deleteItemAsync(key);
}

export function getToken(key: TokenKey) {
  return getStorageItem(key);
}

export function setToken(key: TokenKey, value: string) {
  return setStorageItem(key, value);
}

export function deleteToken(key: TokenKey) {
  return deleteStorageItem(key);
}

export async function clearAuthStorage() {
  await Promise.all([
    deleteStorageItem(STORAGE_KEYS.ACCESS_TOKEN),
    deleteStorageItem(STORAGE_KEYS.REFRESH_TOKEN),
    deleteStorageItem(STORAGE_KEYS.AUTH_USER),
  ]);
}
