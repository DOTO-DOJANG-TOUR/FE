import DefaultCardImage from '@/assets/images/festival/common/card-dim-2.png';
import { Colors, FontFamily, Radius } from '@/constants/theme';
import { Image } from 'expo-image';
import { ImageSourcePropType, StyleSheet, Text, View } from 'react-native';

type Props = {
    image?: ImageSourcePropType,
    region: string,
}

export default function RegionCategoryCard({
    image,
    region
}: Props) {

    return (
        <View style={styles.container}>
            <Image
                source={image ?? DefaultCardImage}
                style={styles.image}
                contentFit="cover"
            />
            <Text style={styles.region}>{region}</Text>
        </View>
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