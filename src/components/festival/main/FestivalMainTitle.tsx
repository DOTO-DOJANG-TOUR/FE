import { Colors, FontFamily, FontSize } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
    subtitle?: string,
    title: string,
}

export default function FestivalMainTitle({ subtitle, title }: Props) {
    return (
        <View style={styles.container}>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            <Text style={styles.title}>{title}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 30,
    },
    subtitle: {
        fontFamily: FontFamily.bold,
        color: Colors.pink.pink50,
        fontSize: FontSize.sm,
        lineHeight: FontSize.sm * 1.5,
    },
    title: {
        fontFamily: FontFamily.semiBold,
        color: Colors.gray.gray100,
        fontSize: 22,
        lineHeight: 22 * 1.5,
    },
});