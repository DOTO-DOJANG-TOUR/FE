import { useEffect, useState } from 'react';

// isLoading이 켜졌다가 delayMs 안에 다시 꺼지면(응답이 빠른 경우) 로딩 표시 자체를 생략한다.
// 스피너가 반짝 떴다 바로 사라지는 깜빡임을 없애기 위한 지연 노출 기법.
export function useDelayedLoading(isLoading: boolean, delayMs = 200) {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoading(isLoading), isLoading ? delayMs : 0);
    return () => clearTimeout(timer);
  }, [isLoading, delayMs]);

  return showLoading;
}
