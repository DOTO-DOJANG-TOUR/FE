import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { DojangTourStatus, FestivalStatus } from '@/types/festival';
import { StyleSheet, Text, View } from 'react-native';

type BadgeStatus =
    | FestivalStatus
    | Extract<DojangTourStatus, 'PROGRESS' | 'REWARDED' | 'FESTIVAL_ENDED'>
    | 'REWARD';

type Props = {
    status: BadgeStatus;
    paddingHorizontal?: number;
    paddingVertical?: number;
    fontSize?: number;
    minWidth?: number;
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
    PROGRESS: {
        label: '투어 중',
        textColor: '#4598FE',
        backgroundColor: '#F2F9FF',
    },
    REWARD: {
        label: '보상 받기',
        textColor: '#4598FE',
        backgroundColor: '#F2F9FF',
    },
    REWARDED: {
        label: '보상 획득',
        textColor: '#BCBCBC',
        backgroundColor: '#F6F6F6',
    },
    FESTIVAL_ENDED: {
        label: '기간 만료',
        textColor: '#BCBCBC',
        backgroundColor: '#F6F6F6',
    },
};

export const FestivalStatusBadge = ({
    status,
    paddingHorizontal = Spacing.two,
    paddingVertical = 3,
    fontSize = FontSize.xs,
    minWidth,
}: Props) => {
    const config = statusConfig[status];

    return (
        <View style={[styles.badge, {
            backgroundColor: config.backgroundColor,
            paddingHorizontal,
            paddingVertical,
            minWidth,
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
        alignItems: 'center',
    },

    text: {
        fontFamily: FontFamily.semiBold,
    }
});
