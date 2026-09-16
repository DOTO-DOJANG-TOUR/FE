export type GeoPoint = { lat: number; lng: number };

const EARTH_RADIUS_M = 6371000;
const NEARBY_RADIUS_M = 10_000;
const MIN_NEARBY_COUNT = 5;
// 이 거리 이내면 지도에서 하나의 마커로 묶는다(완전히 같은 좌표가 아니어도 가까우면 겹쳐 보이므로).
const MARKER_GROUP_RADIUS_M = 50;

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

export type GeoGroup<T> = { lat: number; lng: number; items: T[] };

// 좌표가 실제로 가까운(MARKER_GROUP_RADIUS_M 이내) 관광지를 하나의 그룹으로 묶는다(#37).
// 완전히 같은 좌표가 아니어도 지도에서 겹쳐 보일 정도로 가까우면 묶이도록 정확한 거리 계산을 쓴다.
// 그룹에 새 항목이 들어올 때마다 마커 위치를 그룹 구성원들의 평균 좌표로 갱신한다.
export function groupByCoordinate<T>(items: T[], getPoint: (item: T) => GeoPoint): GeoGroup<T>[] {
  const groups: GeoGroup<T>[] = [];

  items.forEach((item) => {
    const point = getPoint(item);
    // 그룹 평균 좌표(centroid)만 비교하면, centroid가 계속 이동하면서 서로 50m보다 먼
    // 관광지끼리도 연쇄적으로 같은 그룹에 묶일 수 있다. 그룹 내 모든 기존 구성원과 각각
    // 50m 이내인 경우에만 묶는다.
    const existing = groups.find((group) =>
      group.items.every(
        (groupItem) => distanceMeters(getPoint(groupItem), point) <= MARKER_GROUP_RADIUS_M,
      ),
    );

    if (existing) {
      existing.items.push(item);
      existing.lat =
        existing.items.reduce((sum, groupItem) => sum + getPoint(groupItem).lat, 0) /
        existing.items.length;
      existing.lng =
        existing.items.reduce((sum, groupItem) => sum + getPoint(groupItem).lng, 0) /
        existing.items.length;
    } else {
      groups.push({ lat: point.lat, lng: point.lng, items: [item] });
    }
  });

  return groups;
}
