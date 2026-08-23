import { RegionalFestivalPage } from '@/pages/festival/RegionalFestivalPage';
import { useLocalSearchParams } from 'expo-router';

export default function Region() {
  const { subtitle, title } = useLocalSearchParams<{
    subtitle: string;
    title: string;
  }>();

  return (
    <RegionalFestivalPage
      subtitle={subtitle}
      title={title}
    />
  );
}