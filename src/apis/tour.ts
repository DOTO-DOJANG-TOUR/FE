import type { TourContent, TourSpotDetail } from '@/types/tour';
import { apiFetch } from './client';

// keyword를 아예 생략해야 전체 조회다(API_SPEC.md "투어 / 관광지" 참고).
// 빈 문자열을 넘기면 백엔드가 빈 키워드 검색으로 해석할 수 있어 search.ts의 searchTours와는 분리한다.
export const getTourSpots = async (festivalId: string): Promise<TourContent[]> => {
  return apiFetch<TourContent[]>(`/api/v1/festival/${festivalId}/tour-spots`);
};

export const getTourSpotDetail = async (
  festivalId: string,
  tourSpotId: string,
): Promise<TourSpotDetail> => {
  return apiFetch<TourSpotDetail>(
    `/api/v1/festival/${festivalId}/tour-spots/${tourSpotId}`,
  );
};
