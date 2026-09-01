import type { ApiEnvelope, AuthSession } from '@/types/auth';
import {
  clearAuthStorage,
  getToken,
  setToken,
  TOKEN_KEYS,
} from '@/utils/secureStore';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '');
const DEFAULT_TIMEOUT_MS = 10000;

type ApiFetchOptions = RequestInit & {
  skipAuth?: boolean;
  skipRefresh?: boolean;
};

type ErrorEnvelope = Partial<ApiEnvelope<null>>;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let refreshPromise: Promise<AuthSession> | null = null;
let onSessionExpired: (() => void | Promise<void>) | null = null;

export function setSessionExpiredHandler(handler: () => void | Promise<void>) {
  onSessionExpired = handler;
  return () => {
    if (onSessionExpired === handler) onSessionExpired = null;
  };
}

async function readBody(response: Response) {
  if (response.status === 204) return undefined;

  const text = await response.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function unwrapResponse<T>(body: unknown): T {
  if (
    typeof body === 'object' &&
    body !== null &&
    'isSuccess' in body &&
    'result' in body
  ) {
    return (body as ApiEnvelope<T>).result;
  }

  return body as T;
}

function getApiError(response: Response, body: unknown, fallback: string) {
  const error = (body ?? {}) as ErrorEnvelope;
  const failedEnvelope =
    typeof body === 'object' &&
    body !== null &&
    'isSuccess' in body &&
    (body as ErrorEnvelope).isSuccess === false;

  if (!response.ok || failedEnvelope) {
    return new ApiError(error.message ?? fallback, response.status, error.code);
  }

  return null;
}

async function expireSession() {
  await clearAuthStorage();
  await onSessionExpired?.();
}

export async function refreshAuthSession(): Promise<AuthSession> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    if (!BASE_URL) {
      throw new Error('EXPO_PUBLIC_API_BASE_URL이 설정되지 않았습니다.');
    }

    const refreshToken = await getToken(TOKEN_KEYS.REFRESH_TOKEN);
    if (!refreshToken) throw new ApiError('로그인이 필요합니다.', 401);

    const response = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const body = await readBody(response);

    const error = getApiError(
      response,
      body,
      '로그인이 만료되었습니다. 다시 로그인해 주세요.',
    );
    if (error) throw error;

    const session = unwrapResponse<AuthSession>(body);
    if (!session?.accessToken || !session.refreshToken) {
      throw new ApiError('토큰 재발급 응답이 올바르지 않습니다.', 502);
    }
    await Promise.all([
      setToken(TOKEN_KEYS.ACCESS_TOKEN, session.accessToken),
      setToken(TOKEN_KEYS.REFRESH_TOKEN, session.refreshToken),
    ]);
    return session;
  })()
    .catch(async (error) => {
      await expireSession();
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export async function apiFetch<T>(
  path: string,
  { skipAuth = false, skipRefresh = false, ...init }: ApiFetchOptions = {},
): Promise<T> {
  if (!BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL이 설정되지 않았습니다. .env를 확인하세요.');
  }

  const accessToken = skipAuth ? null : await getToken(TOKEN_KEYS.ACCESS_TOKEN);
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    signal: init.signal ?? AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init.headers,
    },
  });

  if (response.status === 401 && !skipAuth && !skipRefresh) {
    await refreshAuthSession();
    return apiFetch<T>(path, { ...init, skipRefresh: true });
  }

  const body = await readBody(response);
  const error = getApiError(response, body, `요청에 실패했습니다. (${response.status})`);
  if (error) throw error;

  return unwrapResponse<T>(body);
}
