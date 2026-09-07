import { BackIcon } from '@/components/icons/BackIcon';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import FestivalMainTitle from '../main/FestivalMainTitle';

type Props = {
    subtitle: string;
    title: string;
}

export default function RegionalHeader({
    subtitle,
    title,
}: Props) {
    const router = useRouter();

    return (
        <View>
            <Pressable
                style={styles.backButton}
                onPress={() => router.back()}
            >
                <BackIcon />
            </Pressable>
            <FestivalMainTitle subtitle={subtitle} title={title} />
        </View>
    )
}


const styles = StyleSheet.create({
    backButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 32,
        height: 32,
        marginHorizontal: 20,
        paddingTop: 4,
    },
});