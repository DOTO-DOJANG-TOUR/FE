import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const TERMS_AGREEMENT_KEY = 'DOTO_TERMS_AGREED_V1';
const LOCATION_AGREEMENT_KEY = 'DOTO_LOCATION_AGREED_V1';

type AgreementState = {
  initialized: boolean;

  hasAgreed: boolean;
  hasLocationAgreed: boolean;

  initialize: () => Promise<void>;
  agree: () => Promise<void>;
  agreeLocation: () => Promise<void>;
};

export const useAgreementStore = create<AgreementState>((set) => ({
  initialized: false,

  hasAgreed: false,
  hasLocationAgreed: false,

  initialize: async () => {
    try {
      const [termsValue, locationValue] = await Promise.all([
        AsyncStorage.getItem(TERMS_AGREEMENT_KEY),
        AsyncStorage.getItem(LOCATION_AGREEMENT_KEY),
      ]);

      set({
        initialized: true,
        hasAgreed: termsValue === 'true',
        hasLocationAgreed: locationValue === 'true',
      });
    } catch (error) {
      console.error('동의 정보 조회 실패:', error);

      set({
        initialized: true,
        hasAgreed: false,
        hasLocationAgreed: false,
      });
    }
  },

  agree: async () => {
    await AsyncStorage.setItem(
      TERMS_AGREEMENT_KEY,
      'true',
    );

    set({
      hasAgreed: true,
    });
  },

  agreeLocation: async () => {
    await AsyncStorage.setItem(
      LOCATION_AGREEMENT_KEY,
      'true',
    );

    set({
      hasLocationAgreed: true,
    });
  },
}));