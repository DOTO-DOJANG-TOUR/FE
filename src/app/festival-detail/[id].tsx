import FestivalDetailPage from '@/pages/festival/FestivalDetailPage';
import { useLocalSearchParams } from 'expo-router';

export default function FestivalDetail() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  return (
    <FestivalDetailPage
      festivalId={Number(id)}
    />
  );
}