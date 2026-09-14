import { getCurrentVisitTourSpot } from '@/apis/tourVisit';
import { getCachedFestivalId, saveActiveVisitFestivalId } from '@/utils/tourVisitCache';
import { create } from 'zustand';

type TourVisitStatus = 'restoring' | 'idle' | 'active' | 'error';

type TourVisitState = {
  status: TourVisitStatus;
  festivalId: string | null;
  tourSpotId: string | null;
  tourSpotName: string | null;
  expiresAt: string | null;

  // 로그인 직후·포그라운드 복귀·취소/도장 획득/만료 직후 서버 기준으로 상태를 다시 확인한다.
  restore: () => Promise<void>;
  // 방문을 막 시작한 직후에는 시작 응답을 그대로 반영한다(재조회 불필요).
  start: (visit: {
    festivalId: string;
    tourSpotId: string;
    tourSpotName: string;
    expiresAt: string;
  }) => Promise<void>;
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
      set({
        status: 'active',
        festivalId,
        tourSpotId: current.tourSpotId,
        tourSpotName: current.tourSpotName,
        expiresAt: current.expiresAt,
      });
    } catch {
      set({ status: 'error' });
    }
  },

  start: async ({ festivalId, tourSpotId, tourSpotName, expiresAt }) => {
    await saveActiveVisitFestivalId(tourSpotId, festivalId);
    set({ status: 'active', festivalId, tourSpotId, tourSpotName, expiresAt });
  },
}));
