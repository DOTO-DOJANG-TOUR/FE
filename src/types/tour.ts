export type TourContent = {
  tourSpotId: string;
  title: string;
  imageUrl?: string;
  address: string;
  mapX: string; // 경도, 문자열(TourSpotDetailResponseDTO 기준)
  mapY: string; // 위도, 문자열
  category: string; // 한글 enum("문화"|"역사"|"자연"|"체험") — mapTourCategory로 변환해서 씀
  // API 응답 필드 아님. GPS 확보 후 FE에서 계산해 채워 넣는 표시용 거리(formatDistance 결과).
  // 위치 권한이 없거나 아직 계산 전이면 undefined.
  distance?: string;
};

export type TourSpotDetail = TourContent & {
  imageList: string[];
  legalDongSigunguCode: string;
  phone?: string;
  apiModifiedAt: string;
};

// GET /api/v1/stamp-tour 응답. tourSpots는 축제 위치 기준 거리순으로 내려오고
// 각 항목의 distance는 백엔드가 이미 "1.2km"/"850m" 형태로 포맷해서 준다.
export type StampTourDetail = {
  festivalId: string;
  title: string;
  stampCount: number;
  tourSpots: TourContent[];
};

export type TourFilterCategory = 'menu' | 'culture' | 'history' | 'nature' | 'experience';
export type TourCategory = Exclude<TourFilterCategory, 'menu'>;

export type TourAttraction = {
  id: string;
  title: string;
  distance: string;
  address: string;
  category: TourCategory;
  imageUrls: string[];
  phone?: string;
  // TourSpotDetailResponseDTO에 웹사이트 필드가 없어 항상 비어 있을 수 있음(축제와 달리 관광지엔 homepageUrl 없음).
  homepage?: string;
  visited?: boolean;
};

export type CurrentVisitTourSpot = {
  tourSpotId: string;
  tourSpotName: string;
  expiresAt: string;
};

export type StampLocation = {
  mapX: number;
  mapY: number;
};

export type Stamp = {
  stampId: string;
};
