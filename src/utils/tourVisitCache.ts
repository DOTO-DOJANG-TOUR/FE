import AsyncStorage from '@react-native-async-storage/async-storage';

// [임시 처리 - docs/OPEN_QUESTIONS.md B-5] GET /stamps/current-visit-tour-spot 응답에
// festivalId가 없어, 방문 취소·도장 획득 API(URL에 festivalId 필요) 호출에 쓸 값을
// 방문 시작 시점에 기기에 캐싱해뒀다가 재진입 복원 때 사용한다.
// 백엔드 응답에 festivalId가 추가되면 이 파일과 호출부를 제거한다.
const CACHE_KEY = 'activeTourVisit.festivalId';

type CachedEntry = { tourSpotId: string; festivalId: string };

export async function saveActiveVisitFestivalId(tourSpotId: string, festivalId: string) {
  const entry: CachedEntry = { tourSpotId, festivalId };
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(entry));
}

export async function getCachedFestivalId(tourSpotId: string): Promise<string | null> {
  const raw = await AsyncStorage.getItem(CACHE_KEY);
  if (!raw) return null;

  try {
    const entry = JSON.parse(raw) as CachedEntry;
    return entry.tourSpotId === tourSpotId ? entry.festivalId : null;
  } catch {
    return null;
  }
}

export async function clearActiveVisitFestivalId() {
  await AsyncStorage.removeItem(CACHE_KEY);
}
