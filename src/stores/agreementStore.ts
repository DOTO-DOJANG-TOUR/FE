import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const AGREEMENT_KEY = 'DOTO_TERMS_AGREED_V1';

type AgreementState = {
  initialized: boolean;
  hasAgreed: boolean;

  initialize: () => Promise<void>;
  agree: () => Promise<void>;
};

export const useAgreementStore = create<AgreementState>((set) => ({
  initialized: false,
  hasAgreed: false,

  initialize: async () => {
    try {
      const value = await AsyncStorage.getItem(AGREEMENT_KEY);

      set({
        initialized: true,
        hasAgreed: value === 'true',
      });
    } catch (error) {
      console.error('약관 동의 정보 조회 실패:', error);

      set({
        initialized: true,
        hasAgreed: false,
      });
    }
  },

  agree: async () => {
    await AsyncStorage.setItem(
      AGREEMENT_KEY,
      'true',
    );

    set({
      hasAgreed: true,
    });
  },
}));