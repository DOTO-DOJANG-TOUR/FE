import type { ApiEnvelope, AuthSession } from '@/types/auth';
import {
  clearAuthStorage,
  getToken,
  setToken,
  TOKEN_KEYS,
} from '@/utils/secureStore';
import NetInfo from '@react-native-community/netinfo';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '');
const DEFAULT_TIMEOUT_MS = 10000;
const HTTP_DATE_PRECISION_MIDPOINT_MS = 500;

let serverClockOffsetMs: number | null = null;

function syncServerClock(response: Response, requestStartedAt: number) {
  const serverDate = response.headers.get('Date');
  if (!serverDate) return;

  const serverDateMs = Date.parse(serverDate);
  if (!Number.isFinite(serverDateMs)) return;

  const receivedAt = Date.now();
  const halfRoundTripMs = Math.max(0, receivedAt - requestStartedAt) / 2;
  // HTTP Date는 초 단위라 해당 초의 중간값을 사용하고, 왕복 시간의 절반만큼 수신 시각으로 보정한다.
  serverClockOffsetMs =
    serverDateMs + HTTP_DATE_PRECISION_MIDPOINT_MS + halfRoundTripMs - receivedAt;
}

export function getServerNowMs() {
  return Date.now() + (serverClockOffsetMs ?? 0);
}

export class NetworkOfflineError extends Error {
  constructor() {
    super('오프라인 상태입니다.');
    this.name = 'NetworkOfflineError';
  }
}

// 기기가 오프라인이면 API 요청 자체를 보내지 않고 즉시 실패시킨다.
async function assertOnline() {
  const state = await NetInfo.fetch();
  if (state.isConnected === false) {
    throw new NetworkOfflineError();
  }
}

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

// 4xx(인증 거부 등)는 같은 요청을 재시도해도 결과가 바뀌지 않는 확정된 실패다.
// 그 외(오프라인/5xx/타임아웃)는 일시적인 문제이므로 재시도 대상으로 본다.
export function isRetryableError(error: unknown) {
  if (error instanceof ApiError) return error.status >= 500;
  return true;
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

    await assertOnline();

    const requestStartedAt = Date.now();
    const response = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    syncServerClock(response, requestStartedAt);
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
      // 오프라인/서버 오류 등 일시적인 문제로 갱신이 실패한 것뿐이라면 세션을 유지한다.
      // 재발급 자체가 거부된 경우(리프레시 토큰 무효/만료 등)에만 로그아웃 처리한다.
      if (!isRetryableError(error)) {
        await expireSession();
      }
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

  await assertOnline();

  const accessToken = skipAuth ? null : await getToken(TOKEN_KEYS.ACCESS_TOKEN);
  const requestStartedAt = Date.now();
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    signal: init.signal ?? AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init.headers,
    },
  });
  syncServerClock(response, requestStartedAt);

  if (response.status === 401 && !skipAuth && !skipRefresh) {
    await refreshAuthSession();
    return apiFetch<T>(path, { ...init, skipRefresh: true });
  }

  const body = await readBody(response);
  const error = getApiError(response, body, `요청에 실패했습니다. (${response.status})`);
  if (error) {
    console.log('[apiFetch]', init.method ?? 'GET', path, '-> status', response.status, 'error =', JSON.stringify(body));
    throw error;
  }

  return unwrapResponse<T>(body);
}
