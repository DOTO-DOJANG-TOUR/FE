import type { CurrentVisitTourSpot, Stamp } from '@/types/tour';
import { apiFetch } from './client';

export const startTourSpotVisit = async (
  festivalId: string,
  tourSpotId: string,
): Promise<CurrentVisitTourSpot> => {
  return apiFetch<CurrentVisitTourSpot>(
    `/api/v1/festival/${festivalId}/tour-spots/${tourSpotId}/visit`,
    { method: 'POST' },
  );
};

export const stopTourSpotVisit = async (
  festivalId: string,
  tourSpotId: string,
): Promise<void> => {
  await apiFetch<void>(
    `/api/v1/festival/${festivalId}/tour-spots/${tourSpotId}/visit`,
    { method: 'DELETE' },
  );
};

// 활성 방문이 없으면 result: null로 응답한다고 가정(#48 OPEN_QUESTIONS B-2, 백엔드 확정 필요).
export const getCurrentVisitTourSpot = async (): Promise<CurrentVisitTourSpot | null> => {
  const result = await apiFetch<CurrentVisitTourSpot | null>(
    '/api/v1/stamps/current-visit-tour-spot',
  );
  return result ?? null;
};

export const createTourSpotStamp = async (
  festivalId: string,
  tourSpotId: string,
): Promise<Stamp> => {
  // 300m 도착 여부는 기기에서 판정하며 사용자의 GPS 원좌표는 서버에 전송하지 않는다.
  return apiFetch<Stamp>(
    `/api/v1/festival/${festivalId}/tour-spots/${tourSpotId}/stamps`,
    { method: 'POST' },
  );
};
