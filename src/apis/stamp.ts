import type { StampTourDetail } from "@/types/tour";
import { apiFetch } from "./client";

// festivalId 없이 로그인한 사용자의 현재 진행 중인(PROGRESS) 스탬프 투어를 조회한다.
// 진행 중인 투어가 없으면 result가 null이라 apiFetch가 그대로 null을 반환한다.
export const getMyStampTour = async (): Promise<StampTourDetail | null> => {
  return apiFetch<StampTourDetail | null>('/api/v1/stamp-tour');
};

export const startStampTour = async (
  festivalId: string,
): Promise<void> => {
  await apiFetch<void>(
    `/api/v1/festival/${festivalId}/stamp-tour`,
    {
      method: 'POST',
    },
  );
};

export const stopStampTour = async (
  festivalId: string,
): Promise<void> => {
  await apiFetch<void>(
    `/api/v1/festival/${festivalId}/stamp-tour`,
    {
      method: 'DELETE',
    },
  );
};