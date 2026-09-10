import StampDetailPage from "@/pages/stamp/StampDetailPage";
import { useLocalSearchParams } from "expo-router";

export default function StampDetail() {
    const { id } = useLocalSearchParams<
        {
            id: string;
        }>();

    return (
        <StampDetailPage
            festivalId={id}
        />
    );
}