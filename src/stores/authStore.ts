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
    set({ status: 'unauthenticated', user: null });
  },

  logout: async () => {
    try {
      await signOutFromServer();
    } finally {
      await clearAuthStorage();
      set({ status: 'unauthenticated', user: null });
    }
  },
}));
