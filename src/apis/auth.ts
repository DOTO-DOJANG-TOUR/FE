import { apiFetch } from '@/apis/client';
import type { AuthSession, SocialProvider } from '@/types/auth';
import { getToken, TOKEN_KEYS } from '@/utils/secureStore';

function decodeJwtPayload(token: string) {
  try {
    const payloadSegment = token.split('.')[1] ?? '';
    const normalized = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const decoded = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    return JSON.parse(decoded);
  } catch (e) {
    return { decodeError: String(e) };
  }
}

export function signInWithSocialToken(provider: SocialProvider, idToken: string) {
  console.log('[signInWithSocialToken] provider =', provider);
  console.log('[signInWithSocialToken] idToken payload =', JSON.stringify(decodeJwtPayload(idToken)));
  console.log('[signInWithSocialToken] idToken (전체) =', idToken);
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
