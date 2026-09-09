import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { FestivalStatus } from '@/types/festival';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
    status: FestivalStatus;
    paddingHorizontal?: number;
    paddingVertical?: number;
    fontSize?: number;
};

const statusConfig = {
    UPCOMING: {
        label: '개최 전',
        textColor: '#FF8076',
        backgroundColor: '#FFF2F2',
    },
    ONGOING: {
        label: '개최 중',
        textColor: '#4598FE',
        backgroundColor: '#F2F9FF',
    },
    ENDED: {
        label: '종료',
        textColor: '#F2F2F2',
        backgroundColor: '#5A5A5A',
    },
};

export const FestivalStatusBadge = ({
    status,
    paddingHorizontal = Spacing.two,
    paddingVertical = 3,
    fontSize = FontSize.xs,
}: Props) => {
    const config = statusConfig[status];

    return (
        <View style={[styles.badge, {
            backgroundColor: config.backgroundColor,
            paddingHorizontal,
            paddingVertical,
        }]}>
            <Text style={[styles.text, {
                color: config.textColor,
                fontSize,
            }]}>
                {config.label}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    badge: {
        borderRadius: Radius.sm,
        alignSelf: 'flex-start',
    },

    text: {
        fontFamily: FontFamily.semiBold,
    }
});
