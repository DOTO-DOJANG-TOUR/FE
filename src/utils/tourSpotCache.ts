import type { TourContent, TourSpotDetail } from '@/types/tour';

// 관광지 상세 화면(/visit)으로 이동하기 전에 미리 받아둔 데이터를 잠깐 들고 있는 캐시.
// 카드를 누른 시점에 먼저 fetch를 끝내고 나서 이동해야 "회색 로딩 화면"이 안 뜨고
// 이전 화면이 유지되다가 부드럽게 전환된다(#37). 세션 메모리에만 두는 임시 캐시라 새로고침되면 사라진다.
type CacheEntry = { detail: TourSpotDetail; spots: TourContent[] };

const cache = new Map<string, CacheEntry>();

function cacheKey(festivalId: string, attractionId: string) {
  return `${festivalId}:${attractionId}`;
}

export function getCachedTourSpot(festivalId: string, attractionId: string): CacheEntry | undefined {
  return cache.get(cacheKey(festivalId, attractionId));
}

export function setCachedTourSpot(festivalId: string, attractionId: string, entry: CacheEntry) {
  cache.set(cacheKey(festivalId, attractionId), entry);
}
