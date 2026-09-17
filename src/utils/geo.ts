export type GeoPoint = { lat: number; lng: number };

const EARTH_RADIUS_M = 6371000;
const NEARBY_RADIUS_M = 10_000;
const MIN_NEARBY_COUNT = 5;
// 이 거리 이내로 가까우면(완전히 같은 좌표가 아니어도 지도에서 겹쳐 보일 정도면) declutterCoordinates가
// 서로 밀어내듯 재배치한다. 밀어낸 뒤 목표 간격도 동일하게 이 값을 쓴다.
const MARKER_DECLUTTER_THRESHOLD_M = 50;

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

// 좌표가 실제로 가까운(MARKER_DECLUTTER_THRESHOLD_M 이내) 항목들을 하나의 군집으로 묶는다.
// 완전히 같은 좌표가 아니어도 지도에서 겹쳐 보일 정도로 가까우면 묶이도록 정확한 거리 계산을 쓴다.
// 군집 평균 좌표(centroid)만 비교하면, centroid가 계속 이동하면서 서로 기준보다 먼 항목끼리도
// 연쇄적으로 같은 군집에 묶일 수 있어 군집 내 모든 기존 구성원과 각각 기준 이내인 경우에만 묶는다.
function clusterByProximity<T>(items: T[], getPoint: (item: T) => GeoPoint): T[][] {
  const clusters: { point: GeoPoint; members: T[] }[] = [];

  items.forEach((item) => {
    const point = getPoint(item);
    const existing = clusters.find((cluster) =>
      cluster.members.every(
        (member) => distanceMeters(getPoint(member), point) <= MARKER_DECLUTTER_THRESHOLD_M,
      ),
    );

    if (existing) {
      existing.members.push(item);
      existing.point = {
        lat: existing.members.reduce((sum, member) => sum + getPoint(member).lat, 0) / existing.members.length,
        lng: existing.members.reduce((sum, member) => sum + getPoint(member).lng, 0) / existing.members.length,
      };
    } else {
      clusters.push({ point, members: [item] });
    }
  });

  return clusters.map((cluster) => cluster.members);
}

// 좌표가 겹쳐 보일 만큼 가까운 관광지를 마커 하나로 합치는 대신(PM 요청으로 #37에서 방향 전환),
// 각자 제 마커를 유지한 채 군집 중심에서 원형으로 살짝 밀어내 배치한다 — 자석의 같은 극처럼
// 서로 가까이 있지만 겹치지 않고 구분되어 탭할 수 있게 한다. 목표 간격은 군집을 묶는 기준
// 거리(MARKER_DECLUTTER_THRESHOLD_M)와 동일해서, 원래 그 정도로 가까웠던 좌표들이 딱 그
// 기준만큼 떨어진 것처럼 보이게 한다.
export function declutterCoordinates<T>(
  items: T[],
  getPoint: (item: T) => GeoPoint,
): (T & { point: GeoPoint })[] {
  return clusterByProximity(items, getPoint).flatMap((members) => {
    if (members.length === 1) {
      return [{ ...members[0], point: getPoint(members[0]) }];
    }

    const centroid = {
      lat: members.reduce((sum, member) => sum + getPoint(member).lat, 0) / members.length,
      lng: members.reduce((sum, member) => sum + getPoint(member).lng, 0) / members.length,
    };
    const centroidLatRad = toRadians(centroid.lat);
    // 원 위에 N개를 고르게 놓았을 때 인접한 두 점 사이의 현(chord) 길이가
    // MARKER_DECLUTTER_THRESHOLD_M가 되도록 반지름을 역산한다.
    const radiusM =
      MARKER_DECLUTTER_THRESHOLD_M / (2 * Math.sin(Math.PI / members.length));

    return members.map((member, index) => {
      const angle = (2 * Math.PI * index) / members.length;
      const dLat = ((radiusM * Math.cos(angle)) / EARTH_RADIUS_M) * (180 / Math.PI);
      const dLng =
        ((radiusM * Math.sin(angle)) / (EARTH_RADIUS_M * Math.cos(centroidLatRad))) * (180 / Math.PI);

      return { ...member, point: { lat: centroid.lat + dLat, lng: centroid.lng + dLng } };
    });
  });
}
