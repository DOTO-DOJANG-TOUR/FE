import { create } from 'zustand';

type User = {
  id: string;
  email: string;
};

type AuthState = {
  isLoggedIn: boolean;
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: null,
  setUser: (user) => set({ isLoggedIn: true, user }),
  logout: () => set({ isLoggedIn: false, user: null }),
}));
