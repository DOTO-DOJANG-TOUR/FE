import { apiFetch } from '@/apis/client';
import type { AuthSession, SocialProvider } from '@/types/auth';
import { getToken, TOKEN_KEYS } from '@/utils/secureStore';

export function signInWithSocialToken(provider: SocialProvider, idToken: string) {
  return apiFetch<AuthSession>(`/api/v1/auth/social/${provider}`, {
    method: 'POST',
    body: JSON.stringify({ idToken }),
    skipAuth: true,
    skipRefresh: true,
  });
}

export async function signOutFromServer() {
  const refreshToken = await getToken(TOKEN_KEYS.REFRESH_TOKEN);
  if (!refreshToken) return;

  await apiFetch<void>('/api/v1/auth/sign-out', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
    skipAuth: true,
    skipRefresh: true,
  });
}
