import type { GeoPoint } from '@/utils/geo';

// 로그인에도 쓰는 REST API 키를 재사용한다(카카오맵 JS 키와는 다른, 앱 전체 공용 REST API 키).
const REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_CLIENT_ID;

// 축제 좌표(mapX/mapY)를 내려주는 API가 없어서(docs/OPEN_QUESTIONS.md "C" 참고), 축제 상세의
// address 문자열을 카카오 로컬 API(주소 검색)로 좌표 변환해 초기 지도 중심에 쓴다. 백엔드 API가
// 아니라 외부(Kakao) API라 실패해도 조용히 null을 반환하고, 호출부는 관광지 목록 bounds로 대체한다.
export async function geocodeAddress(address: string): Promise<GeoPoint | null> {
  if (!REST_API_KEY || !address.trim()) return null;

  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
      { headers: { Authorization: `KakaoAK ${REST_API_KEY}` } },
    );

    if (!response.ok) return null;

    const body = await response.json();
    const first = body?.documents?.[0];
    if (!first) return null;

    const lat = Number(first.y);
    const lng = Number(first.x);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return { lat, lng };
  } catch (error) {
    console.warn('축제 주소 좌표 변환 실패:', error);
    return null;
  }
}
