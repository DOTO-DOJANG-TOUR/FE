import SearchPage from '@/pages/search/SearchPage';
import { useLocalSearchParams } from 'expo-router';

export default function TourSearch() {
  const { festivalId } =
    useLocalSearchParams<{
      festivalId: string;
    }>();

  return (
    <SearchPage
      type="tour"
      festivalId={festivalId}
    />
  );
}