import { MyTourStampDetail, RewardQrResult, TourStampListResult } from "@/types/stamp";
import { StampTourDetail } from "@/types/tour";
import { apiFetch } from "./client";
import { normalizeTourContents } from './tour';

// festivalId 없이 로그인한 사용자의 현재 진행 중인(PROGRESS) 스탬프 투어를 조회한다.
// 진행 중인 투어가 없으면 result가 null이라 apiFetch가 그대로 null을 반환한다.
export const getMyStampTour = async (): Promise<StampTourDetail | null> => {
  const result = await apiFetch<StampTourDetail | null>('/api/v1/stamp-tour');
  if (!result) return null;
  return { ...result, tourSpots: normalizeTourContents(result.tourSpots) };
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

export const getMyStamps = async (): Promise<TourStampListResult> => {
  const response = await apiFetch<TourStampListResult>(
    `/api/v1/stamps/my-tours`
  );

  return response;
}

export const getMyStampsDetail = async (
  festivalId: string,
): Promise<MyTourStampDetail> => {
  const response = await apiFetch<MyTourStampDetail>(
    `/api/v1/stamps/my-tours/${festivalId}`
  );

  return response;
}

export const getRewardQr = async (
  festivalId: string,
): Promise<RewardQrResult> => {
  return apiFetch<RewardQrResult>(
    `/api/v1/stamps/my-tours/${festivalId}/qr-code`,
  );
};
