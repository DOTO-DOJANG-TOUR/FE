import { refreshAuthSession } from '@/apis/client';
import { signOutFromServer } from '@/apis/auth';
import type { AuthSession, AuthUser } from '@/types/auth';
import {
  clearAuthStorage,
  getStorageItem,
  getToken,
  setStorageItem,
  setToken,
  STORAGE_KEYS,
  TOKEN_KEYS,
} from '@/utils/secureStore';
import { create } from 'zustand';

type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated';

type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;
  // 로그아웃마다 증가하는 세대 값. 로그아웃 도중에 나간 요청(예: tourVisitStore.restore())이
  // 그 사이 재로그인까지 끝난 뒤에 응답으로 돌아와도, 시작 시점의 세대와 비교해 낡은
  // 결과라는 걸 구분할 수 있게 한다 — status만 보면 재로그인 후엔 다시 'authenticated'라
  // 구분이 안 된다.
  sessionGeneration: number;
  initialize: () => Promise<void>;
  completeSignIn: (session: AuthSession) => Promise<void>;
  expireSession: () => Promise<void>;
  logout: () => Promise<void>;
};

function toUser(session: AuthSession): AuthUser {
  return { userId: session.userId, nickname: session.nickname };
}

async function persistSession(session: AuthSession) {
  const user = toUser(session);
  await Promise.all([
    setToken(TOKEN_KEYS.ACCESS_TOKEN, session.accessToken),
    setToken(TOKEN_KEYS.REFRESH_TOKEN, session.refreshToken),
    setStorageItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user)),
  ]);
  return user;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'initializing',
  user: null,
  sessionGeneration: 0,

  initialize: async () => {
    try {
      const [accessToken, refreshToken, serializedUser] = await Promise.all([
        getToken(TOKEN_KEYS.ACCESS_TOKEN),
        getToken(TOKEN_KEYS.REFRESH_TOKEN),
        getStorageItem(STORAGE_KEYS.AUTH_USER),
      ]);

      if (!refreshToken || !serializedUser) {
        await clearAuthStorage();
        set({ status: 'unauthenticated', user: null });
        return;
      }

      const storedUser = JSON.parse(serializedUser) as AuthUser;
      if (accessToken) {
        set({ status: 'authenticated', user: storedUser });
        return;
      }

      const session = await refreshAuthSession();
      const user = await persistSession(session);
      set({ status: 'authenticated', user });
    } catch {
      await clearAuthStorage();
      set({ status: 'unauthenticated', user: null });
    }
  },

  completeSignIn: async (session) => {
    const user = await persistSession(session);
    set({ status: 'authenticated', user });
  },

  expireSession: async () => {
    await clearAuthStorage();
    set((state) => ({
      status: 'unauthenticated', user: null, sessionGeneration: state.sessionGeneration + 1,
    }));
  },

  logout: async () => {
    // 서버·저장소 정리 실패와 관계없이 사용자는 즉시 로그인 화면으로 이동해야 한다.
    set((state) => ({
      status: 'unauthenticated', user: null, sessionGeneration: state.sessionGeneration + 1,
    }));

    void (async () => {
      const refreshToken = await getToken(TOKEN_KEYS.REFRESH_TOKEN).catch(() => null);
      const cleanupTasks = [clearAuthStorage()];

      if (refreshToken) cleanupTasks.push(signOutFromServer(refreshToken));

      await Promise.allSettled(cleanupTasks);
    })();
  },
}));
