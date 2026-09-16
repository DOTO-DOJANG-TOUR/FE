import type { TourContent, TourSpotDetail } from '@/types/tour';
import { apiFetch } from './client';

function asString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

export function normalizeTourContents(value: unknown): TourContent[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const raw = item as Record<string, unknown>;
    const tourSpotId = asString(raw.tourSpotId).trim();
    if (!tourSpotId) return [];

    return [{
      tourSpotId,
      title: asString(raw.title),
      imageUrl: asString(raw.imageUrl) || undefined,
      address: asString(raw.address),
      mapX: asString(raw.mapX),
      mapY: asString(raw.mapY),
      category: asString(raw.category),
      distance: asString(raw.distance) || undefined,
    }];
  });
}

// keyword를 아예 생략해야 전체 조회다(API_SPEC.md "투어 / 관광지" 참고).
// 빈 문자열을 넘기면 백엔드가 빈 키워드 검색으로 해석할 수 있어 search.ts의 searchTours와는 분리한다.
export const getTourSpots = async (festivalId: string): Promise<TourContent[]> => {
  const result = await apiFetch<unknown>(`/api/v1/festival/${festivalId}/tour-spots`);
  return normalizeTourContents(result);
};

export const getTourSpotDetail = async (
  festivalId: string,
  tourSpotId: string,
): Promise<TourSpotDetail | null> => {
  const result = await apiFetch<unknown>(
    `/api/v1/festival/${festivalId}/tour-spots/${tourSpotId}`,
  );
  if (!result || typeof result !== 'object') return null;

  const raw = result as Record<string, unknown>;
  const base = normalizeTourContents([
    { ...raw, tourSpotId: asString(raw.tourSpotId).trim() || tourSpotId },
  ])[0];
  if (!base) return null;

  return {
    ...base,
    imageList: Array.isArray(raw.imageList)
      ? raw.imageList.filter((uri): uri is string => typeof uri === 'string' && !!uri.trim())
      : [],
    legalDongSigunguCode: asString(raw.legalDongSigunguCode),
    phone: asString(raw.phone) || undefined,
    apiModifiedAt: asString(raw.apiModifiedAt),
  };
};
