import { useDelayedLoading } from '@/hooks/use-delayed-loading';
import { LoadingIndicator } from './LoadingIndicator';

// 페이지/목록 로딩은 동일한 지연 정책을 사용하고, 버튼 액션의 작은 스피너는 별도로 둔다.
export function PageLoadingIndicator() {
  const visible = useDelayedLoading(true);
  return visible ? <LoadingIndicator /> : null;
}
