import { getToken, TOKEN_KEYS } from '@/utils/secureStore';
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const DEFAULT_TIMEOUT_MS = 10000;

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL이 설정되지 않았습니다. .env를 확인하세요.');
  }

  const accessToken = await getToken(TOKEN_KEYS.ACCESS_TOKEN);

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    signal: init.signal ?? AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error ${response.status}: ${path}`);
  }

  return response.json();
}
