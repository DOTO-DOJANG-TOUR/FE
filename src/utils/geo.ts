export type GeoPoint = { lat: number; lng: number };

const EARTH_RADIUS_M = 6371000;
const NEARBY_RADIUS_M = 10_000;
const MIN_NEARBY_COUNT = 5;

function toRadians(deg: number) {
  return (deg * Math.PI) / 180;
}

export function distanceMeters(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(Math.min(1, h)));
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export function getCentroid(points: GeoPoint[]): GeoPoint | null {
  if (points.length === 0) return null;

  const sum = points.reduce(
    (acc, point) => ({ lat: acc.lat + point.lat, lng: acc.lng + point.lng }),
    { lat: 0, lng: 0 },
  );

  return { lat: sum.lat / points.length, lng: sum.lng / points.length };
}

// 축제 반경 10km 이내 관광지를 조회하고, 5개 미만이면 5개가 될 때까지 검색 반경을 자동 확장한다(#37).
// 백엔드 tour-spots API가 좌표·반경 파라미터를 받지 않아(docs/OPEN_QUESTIONS.md "C. 투어 지도" 참고)
// 전체 목록을 받은 뒤 거리순 정렬로 반경 필터링·확장을 프론트에서 계산한다.
export function selectNearbySpots<T>(
  spots: T[],
  center: GeoPoint,
  getPoint: (spot: T) => GeoPoint,
): T[] {
  const sorted = [...spots].sort(
    (a, b) => distanceMeters(center, getPoint(a)) - distanceMeters(center, getPoint(b)),
  );

  const withinRadius = sorted.filter(
    (spot) => distanceMeters(center, getPoint(spot)) <= NEARBY_RADIUS_M,
  );

  if (withinRadius.length >= MIN_NEARBY_COUNT) return withinRadius;

  return sorted.slice(0, Math.min(MIN_NEARBY_COUNT, sorted.length));
}
