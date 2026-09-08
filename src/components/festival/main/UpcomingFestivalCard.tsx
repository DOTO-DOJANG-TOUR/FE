import DefaultFestivalImage from '@/assets/images/festival/common/card-dim-2.png';
import { Colors, FontFamily, FontSize, Radius } from '@/constants/theme';
import { getDDay } from '@/utils/date';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
    imageUrl?: string;
    title: string;
    startDate: string;
    region: string;
    onPress?: () => void;
}

export default function UpcomingFestivalCard({
    imageUrl,
    title,
    startDate,
    region,
    onPress,
}: Props) {
    const [imageError, setImageError] = useState(false);
    const { text: dDay } = getDDay(startDate);

    useEffect(() => {
        setImageError(false);
    }, [imageUrl]);

    const imageSource =
        imageUrl && !imageError
            ? { uri: imageUrl }
            : DefaultFestivalImage;

    return (
        <Pressable
            style={styles.container}
            onPress={onPress}
        >
            <Image
                source={imageSource}
                style={styles.image}
                resizeMode='cover'
                onError={() => setImageError(true)}
            />
            <Text
                style={styles.title}
                numberOfLines={1}
                ellipsizeMode='tail'
            >{title}</Text>
            <View style={styles.info}>
                <Text style={styles.region}>{region}</Text>
                <Text style={styles.separator}>·</Text>
                <Text style={styles.date}>{dDay}</Text>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 140,
    },
    image: {
        width: 140,
        height: 140,
        borderRadius: Radius.md,
    },
    title: {
        paddingTop: 8,
        fontFamily: FontFamily.semiBold,
        fontSize: FontSize.md,
        lineHeight: FontSize.md * 1.5,
        color: Colors.gray.gray100,
    },
    info: {
        flexDirection: 'row',
        gap: 6,
    },
    separator: {

    },
    date: {
        fontFamily: FontFamily.semiBold,
        fontSize: FontSize.sm,
        lineHeight: FontSize.sm * 1.5,
        color: Colors.pink.pink50,
    },
    region: {
        fontFamily: FontFamily.regular,
        fontSize: FontSize.sm,
        lineHeight: FontSize.sm * 1.5,
        color: Colors.gray.gray100,
    },
});