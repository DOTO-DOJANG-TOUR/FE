import DefaultFestivalImage from '@/assets/images/festival/common/card-dim-2.png';
import { Colors, FontFamily, FontSize, Radius } from '@/constants/theme';
import { DojangTourStatus } from '@/types/festival';
import { MyTourStamp } from '@/types/tour';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FestivalStatusBadge } from '../common/FestivalStatusBadge';

type Props = {
    stamp: MyTourStamp;
    onPress: () => void;
}

type BadgeStatus =
    | Extract<
        DojangTourStatus,
        'PROGRESS' | 'REWARDED' | 'FESTIVAL_ENDED'
    >
    | 'REWARD';

const getBadgeStatus = (
    status: DojangTourStatus,
    stampCount: number,
): BadgeStatus => {
    if (status === 'REWARDED') {
        return 'REWARDED';
    }

    if (status === 'FESTIVAL_ENDED') {
        return 'FESTIVAL_ENDED';
    }

    if (status === 'PROGRESS' && stampCount >= 3) {
        return 'REWARD';
    }

    return 'PROGRESS';
};

export default function StampItemCard({
    stamp,
    onPress,
}: Props) {
    const badgeStatus = getBadgeStatus(
        stamp.status,
        stamp.stampCount,
    );

    return (
        <Pressable
            style={styles.container}
            onPress={onPress}
        >
            <Image
                style={styles.image}
                source={
                    stamp.imageUrl
                        ? { uri: stamp.imageUrl }
                        : DefaultFestivalImage
                }
            />
            <View style={styles.infoBox}>
                <View>
                    <Text
                        style={styles.title}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >{stamp.title}</Text>
                    <View style={styles.bottomTextSection}>
                        <Text style={styles.stampCount}>{stamp.stampCount}/3</Text>
                        <Text>·</Text>
                        <Text style={styles.endDate}>{stamp.eventEndDate.replace(/-/g, '.')}까지</Text>
                    </View>
                </View>
                <View>
                    <FestivalStatusBadge
                        status={badgeStatus}
                        paddingHorizontal={10}
                        paddingVertical={4}
                        minWidth={72}
                        fontSize={FontSize.sm}
                    />
                </View>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderRadius: Radius.md,
        boxShadow: '0 0 8px rgba(0, 0, 0, 0.08)',
    },
    image: {
        width: '100%',
        height: 131,
        borderTopLeftRadius: Radius.md,
        borderTopRightRadius: Radius.md,
    },
    infoBox: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 50,
    },
    title: {
        fontFamily: FontFamily.semiBold,
        fontSize: FontSize.md,
        lineHeight: FontSize.md * 1.5,
        color: Colors.gray.gray100,
    },
    bottomTextSection: {
        flexDirection: 'row',
        gap: 6,
    },
    stampCount: {
        color: Colors.pink.pink50,
        fontFamily: FontFamily.semiBold,
        fontSize: FontSize.sm,
        lineHeight: FontSize.sm * 1.5,
    },
    endDate: {
        fontFamily: FontFamily.regular,
        fontSize: FontSize.sm,
        lineHeight: FontSize.sm * 1.5,
        color: Colors.gray.gray100,
    },
});