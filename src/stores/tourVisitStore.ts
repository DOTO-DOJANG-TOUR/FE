import { getCurrentVisitTourSpot } from '@/apis/tourVisit';
import { useAuthStore } from '@/stores/authStore';
import { getCachedFestivalId, saveActiveVisitFestivalId } from '@/utils/tourVisitCache';
import { create } from 'zustand';

type TourVisitStatus = 'restoring' | 'idle' | 'active' | 'error';

type TourVisitState = {
  status: TourVisitStatus;
  festivalId: string | null;
  tourSpotId: string | null;
  tourSpotName: string | null;
  expiresAt: string | null;

  // 로그인 직후·포그라운드 복귀·취소/만료 직후 서버 기준으로 상태를 다시 확인한다.
  restore: () => Promise<void>;
  // 방문을 막 시작한 직후에는 시작 응답을 그대로 반영한다(재조회 불필요).
  start: (visit: {
    festivalId: string;
    tourSpotId: string;
    tourSpotName: string;
    expiresAt: string;
  }) => Promise<void>;
  // 도장 획득 API가 성공한 뒤 완료 화면을 닫을 때 서버 재조회 없이 화면 잠금을 해제한다.
  complete: () => void;
};

export const useTourVisitStore = create<TourVisitState>((set) => ({
  status: 'restoring',
  festivalId: null,
  tourSpotId: null,
  tourSpotName: null,
  expiresAt: null,

  restore: async () => {
    try {
      const current = await getCurrentVisitTourSpot();
      // 조회 도중 로그아웃되면(토큰 정리가 비동기라 요청 자체는 성공할 수 있다) 이미 지난
      // 결과를 반영하지 않는다 — 안 그러면 로그인 화면으로 전환된 직후 잠깐 살아있던
      // 활성 방문 상태가 다시 'active'로 덮어써 라우팅 가드가 두 번 갈아끼워진다.
      if (useAuthStore.getState().status !== 'authenticated') return;

      if (!current) {
        set({
          status: 'idle',
          festivalId: null,
          tourSpotId: null,
          tourSpotName: null,
          expiresAt: null,
        });
        return;
      }

      const festivalId = await getCachedFestivalId(current.tourSpotId);
      if (useAuthStore.getState().status !== 'authenticated') return;
      set({
        status: 'active',
        festivalId,
        tourSpotId: current.tourSpotId,
        tourSpotName: current.tourSpotName,
        expiresAt: current.expiresAt,
      });
    } catch {
      if (useAuthStore.getState().status !== 'authenticated') return;
      set({ status: 'error' });
    }
  },

  start: async ({ festivalId, tourSpotId, tourSpotName, expiresAt }) => {
    await saveActiveVisitFestivalId(tourSpotId, festivalId);
    set({ status: 'active', festivalId, tourSpotId, tourSpotName, expiresAt });
  },

  complete: () => set({
    status: 'idle',
    festivalId: null,
    tourSpotId: null,
    tourSpotName: null,
    expiresAt: null,
  }),
}));
