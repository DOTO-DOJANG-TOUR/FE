import DefaultCardImage from '@/assets/images/festival/common/card-dim-2.png';
import { Colors, FontFamily, Radius } from '@/constants/theme';
import { Image } from 'expo-image';
import { ImageSourcePropType, Pressable, StyleSheet, Text } from 'react-native';

type Props = {
    image?: ImageSourcePropType;
    region: string;
    onPress: () => void;
}

export default function RegionCategoryCard({
    image,
    region,
    onPress,
}: Props) {

    return (
        <Pressable
            style={styles.container}
            onPress={onPress}
        >
            <Image
                source={image ?? DefaultCardImage}
                style={styles.image}
                contentFit="cover"
            />
            <Text style={styles.region}>{region}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 62,
        height: 62,
        borderRadius: Radius.md,
        backgroundColor: '#D3D3D3',
    },
    region: {
        paddingTop: 4,
        fontFamily: FontFamily.medium,
        fontSize: 13,
        color: Colors.gray.gray70,
        lineHeight: 13 * 1.5,
    },
});