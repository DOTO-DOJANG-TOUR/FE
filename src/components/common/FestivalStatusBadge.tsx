import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

type FestivalStatus = 'upcoming' | 'ongoing' | 'ended';

type Props = {
    status: FestivalStatus;
};

const statusConfig = {
    upcoming: {
        label: '개최 전',
        textColor: '#FF8076',
        backgroundColor: '#FFF2F2',
    },
    ongoing: {
        label: '개최 중',
        textColor: '#4598FE',
        backgroundColor: '#F2F9FF',
    },
    ended: {
        label: '종료',
        textColor: '#F2F2F2',
        backgroundColor: '#5A5A5A',
    },
};

export const FestivalStatusBadge = ({ status }: Props) => {
    const config = statusConfig[status];

    return (
        <View style={[styles.badge, { backgroundColor: config.backgroundColor }]}>
            <Text style={[styles.text, { color: config.textColor }]}>
                {config.label}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: Spacing.two,
        paddingVertical: 3,
        borderRadius: Radius.sm,
        alignSelf: 'flex-start',
    },

    text: {
        fontSize: FontSize.xs,
        fontFamily: FontFamily.semiBold,
    }
});
