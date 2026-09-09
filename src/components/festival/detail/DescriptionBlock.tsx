import { Colors, FontFamily, FontSize } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
    title: string;
    description?: string;
}

export default function DescriptionBlock({
    title,
    description,
}: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                {title}
            </Text>
            {description ? (
                <Text style={styles.description}>
                    {description}
                </Text>
            ) : (
                <Text style={styles.description}>
                    -
                </Text>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
    title: {
        fontFamily: FontFamily.semiBold,
        fontSize: FontSize.lg,
        lineHeight: FontSize.lg * 1.5,
        color: Colors.gray.gray100,
    },
    description: {
        fontFamily: FontFamily.regular,
        fontSize: FontSize.md,
        lineHeight: FontSize.md * 1.5,
        color: Colors.gray.gray100,
    },
});