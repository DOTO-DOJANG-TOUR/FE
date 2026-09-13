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
  return KOREAN_TO_TOUR_CATEGORY[category] ?? null;
}

export const TOUR_CATEGORY_MARKER_LABEL: Record<TourCategory, string> = {
  culture: '문',
  history: '역',
  nature: '자',
  experience: '체',
};
