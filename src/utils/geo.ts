export type GeoPoint = { lat: number; lng: number };

const NEARBY_RADIUS_M = 10_000;
const MIN_NEARBY_COUNT = 5;

// "1.2km" / "850m" 형태(GET /api/v1/stamp-tour의 distance 필드)를 미터 단위 숫자로 되돌린다.
// 형식이 안 맞으면 반경 비교에서 항상 걸러지도록 +Infinity를 반환한다.
export function parseDistanceMeters(distance: string): number {
  const match = distance.trim().match(/^(\d+(?:\.\d+)?)\s*(km|m)$/i);
  if (!match) return Number.POSITIVE_INFINITY;

  const value = Number(match[1]);
  return match[2].toLowerCase() === 'km' ? value * 1000 : value;
}

// 축제 반경 10km 이내 관광지를 조회하고, 5개 미만이면 5개가 될 때까지 검색 반경을 자동 확장한다(#37).
// GET /api/v1/stamp-tour가 이미 축제 위치 기준 거리순으로 정렬해서 내려주므로(distance 필드),
// 정렬은 그대로 두고 반경 필터링·확장만 프론트에서 계산한다. spots는 오름차순 정렬돼 있다고 가정한다.
export function selectNearbySpots<T>(sortedSpots: T[], getDistanceMeters: (spot: T) => number): T[] {
  const withinRadius = sortedSpots.filter((spot) => getDistanceMeters(spot) <= NEARBY_RADIUS_M);

  if (withinRadius.length >= MIN_NEARBY_COUNT) return withinRadius;

  return sortedSpots.slice(0, Math.min(MIN_NEARBY_COUNT, sortedSpots.length));
}
