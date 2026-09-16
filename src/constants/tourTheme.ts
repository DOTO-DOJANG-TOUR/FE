export const TourColors = {
  gray10: '#FAFAFA',
  gray30: '#F2F2F2',
  gray40: '#E8E8E8',
  gray50: '#D6D6D6',
  link: '#2E78BC',
  location: '#358BFF',
  locationPulse: 'rgba(53, 139, 255, 0.16)',
  sheetShadow: '0 -2px 10px rgba(38, 38, 38, 0.06)',
  buttonAreaShadow: '0 -2px 8px rgba(38, 38, 38, 0.04)',
  searchShadow: '0 0 8px rgba(0, 0, 0, 0.08)',
  locationShadow: '0 2px 8px rgba(38, 38, 38, 0.14)',
} as const;

export const TourTypography = {
  marker: 9,
  compact: 13,
  title: 18,
  sheetTitle: 22,
} as const;

// API는 현재 획득 개수만 반환하며 보상 조건은 서비스 정책상 3개다.
export const REQUIRED_STAMP_COUNT = 3;
