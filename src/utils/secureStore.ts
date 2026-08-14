import * as SecureStore from 'expo-secure-store';

export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;

export type TokenKey = (typeof TOKEN_KEYS)[keyof typeof TOKEN_KEYS];

export function getToken(key: TokenKey) {
  return SecureStore.getItemAsync(key);
}

export function setToken(key: TokenKey, value: string) {
  return SecureStore.setItemAsync(key, value);
}

export function deleteToken(key: TokenKey) {
  return SecureStore.deleteItemAsync(key);
}
