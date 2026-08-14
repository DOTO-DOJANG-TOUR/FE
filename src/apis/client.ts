import { getToken, TOKEN_KEYS } from '@/utils/secureStore';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export async function apiFetch(path: string, init: RequestInit = {}) {
  const accessToken = await getToken(TOKEN_KEYS.ACCESS_TOKEN);

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
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
