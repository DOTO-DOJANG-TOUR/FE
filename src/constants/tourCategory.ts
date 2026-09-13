import type { TourCategory } from '@/types/tour';

// TourSpotDetailResponseDTO의 category는 "문화"|"역사"|"자연"|"체험" 한글 enum으로 내려오고,
// FE TourCategory는 영문 유니온이라 값이 그대로 안 맞는다(#37 착수 전 스웨거 검토에서 확인, API_SPEC.md 참고).
const KOREAN_TO_TOUR_CATEGORY: Record<string, TourCategory> = {
  문화: 'culture',
  역사: 'history',
  자연: 'nature',
  체험: 'experience',
};

export function mapTourCategory(category: string): TourCategory | null {
  if (KOREAN_TO_TOUR_CATEGORY[category]) return KOREAN_TO_TOUR_CATEGORY[category];

  // GET /api/v1/stamp-tour 스웨거 예시엔 "자연관광지"처럼 접미사가 붙은 값이 있어서(다른 엔드포인트의
  // "자연" enum과 불일치) 접두사 일치도 같이 봐준다. 실제 값이 어느 쪽이든 안전하게 동작하도록 방어.
  const prefixMatch = Object.keys(KOREAN_TO_TOUR_CATEGORY).find((key) => category.startsWith(key));
  return prefixMatch ? KOREAN_TO_TOUR_CATEGORY[prefixMatch] : null;
}

export const TOUR_CATEGORY_MARKER_LABEL: Record<TourCategory, string> = {
  culture: '문',
  history: '역',
  nature: '자',
  experience: '체',
};
