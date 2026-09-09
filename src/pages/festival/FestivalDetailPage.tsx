import { getFestivalDetail, getFestivalDojangTourStatus } from '@/apis/festival';
import { startStampTour, stopStampTour } from '@/apis/stamp';
import DefaultFestivalImage from '@/assets/images/festival/common/card-dim-3.png';
import { AlertModal } from '@/components/common/AlertModal';
import { DojangTourButton } from '@/components/common/DojangTourButton';
import { FestivalCategoryBadge } from '@/components/common/FestivalCategoryBadge';
import { FestivalStatusBadge } from '@/components/common/FestivalStatusBadge';
import DescriptionBlock from '@/components/festival/detail/DescriptionBlock';
import { BackIcon } from '@/components/icons/BackIcon';
import { LocationIcon } from '@/components/icons/LocationIcon';
import { PhoneIcon } from '@/components/icons/PhoneIcon';
import { WebIcon } from '@/components/icons/WebIcon';
import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';
import { DojangTourButtonStatus, FestivalDetail } from '@/types/festival';
import { mapDojangTourStatus } from '@/utils/dojangStatus';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ImageBackground, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
    festivalId: string;
};

export default function FestivalDetailPage({
    festivalId,
}: Props) {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [imageError, setImageError] = useState(false);
    const [isStopModalVisible, setIsStopModalVisible] = useState(false);

    const formatMultilineText = (value?: string) => {
        if (!value) return '-';

        return value
            .replace(/\\n/g, '\n')
            .replace(
                /([^\n])\s*(?=(-\s+|\*\s+|•\s*|●\s*|○\s*|▪\s*|■\s*|※\s*|\d+[.)]\s*|[①-⑳]\s*))/g,
                '$1\n'
            );
    };

    const [festival, setFestival] =
        useState<FestivalDetail | null>(null);

    const [dojangStatus, setDojangStatus] =
        useState<DojangTourButtonStatus | null>(null);

    useEffect(() => {
        const fetchFestivalDetail = async () => {
            try {
                const data = await getFestivalDetail(festivalId);

                setFestival(data);
            } catch (error) {
                console.error('축제 상세 조회 실패:', error);
            }
        };

        fetchFestivalDetail();
    }, [festivalId]);

    useEffect(() => {
        const fetchDojangStatus = async () => {
            try {
                const data =
                    await getFestivalDojangTourStatus(festivalId);

                setDojangStatus(
                    mapDojangTourStatus(data.status)
                );
            } catch (error) {
                console.error(
                    '도장투어 상태 조회 실패:',
                    error
                );
            }
        };

        fetchDojangStatus();
    }, [festivalId]);

    useEffect(() => {
        setImageError(false);
    }, [festival?.imageUrl]);

    if (!festival) {
        return null;
    }

    const imageSource =
        festival.imageUrl && !imageError
            ? { uri: festival.imageUrl }
            : DefaultFestivalImage;

    const homeLink = festival.homepageUrl;

    const handleDojangButtonPress = async () => {
        if (dojangStatus === 'start') {
            try {
                await startStampTour(festivalId);

                const data = await getFestivalDojangTourStatus(festivalId);

                setDojangStatus(
                    mapDojangTourStatus(data.status),
                );
            } catch (error) {
                console.error('스탬프 투어 시작 실패:', error);
            }

            return;
        }

        if (dojangStatus === 'stop') {
            setIsStopModalVisible(true);
        }
    };

    const handleStopTour = async () => {
        try {
            await stopStampTour(festivalId);

            const data =
                await getFestivalDojangTourStatus(festivalId);

            setDojangStatus(
                mapDojangTourStatus(data.status),
            );

            setIsStopModalVisible(false);
        } catch (error) {
            console.error('스탬프 투어 중단 실패:', error);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={[
                    styles.scrollView,
                ]}
                showsVerticalScrollIndicator={false}
            >
                <ImageBackground
                    source={imageSource}
                    style={styles.imageSection}
                    resizeMode="cover"
                >
                    <View style={[StyleSheet.absoluteFill, styles.overlay]} />
                    <Pressable
                        style={[
                            styles.backButton,
                            {
                                top: insets.top,
                            },
                        ]}
                        onPress={() => router.back()}
                    >
                        <BackIcon color={Colors.gray.gray00} />
                    </Pressable>
                </ImageBackground>
                <View style={[
                    styles.white,
                    styles.introSection
                ]}>
                    <View style={styles.titleBox}>
                        <Text style={styles.title}>{festival.title}</Text>
                        <View style={styles.badgeBox}>
                            <FestivalStatusBadge
                                status={festival.status}
                                paddingHorizontal={10}
                                paddingVertical={4}
                                fontSize={FontSize.sm}
                            />
                            <FestivalCategoryBadge
                                category={festival.category}
                                paddingHorizontal={10}
                                paddingVertical={4}
                                fontFamily={FontFamily.semiBold}
                                fontSize={FontSize.sm}
                            />
                        </View>
                    </View>
                    <View style={styles.infoBox}>
                        <View style={styles.textBox}>
                            <View style={styles.iconBox}>
                                <LocationIcon />
                            </View>
                            {festival.address ? (
                                <Text
                                    style={styles.text}
                                    numberOfLines={2}
                                    ellipsizeMode='tail'
                                >{festival.address}</Text>
                            ) : (
                                <Text style={styles.text}>-</Text>
                            )}
                        </View>
                        <View style={styles.textBox}>
                            <View style={styles.iconBox}>
                                <PhoneIcon />
                            </View>
                            {festival.phone ? (
                                <Text style={styles.text}>{festival.phone}</Text>
                            ) : (
                                <Text style={styles.text}>-</Text>
                            )}
                        </View>
                        <View style={styles.textBox}>
                            <View style={styles.iconBox}>
                                <WebIcon />
                            </View>
                            {homeLink ? (
                                <Pressable onPress={() => Linking.openURL(homeLink)}>
                                    <Text style={[
                                        styles.text,
                                        styles.underline
                                    ]}>
                                        홈페이지 바로가기
                                    </Text>
                                </Pressable>
                            ) : (
                                <Text style={styles.text}>-</Text>
                            )}
                        </View>
                    </View>
                </View>
                <View style={[
                    styles.descSection,
                    styles.white,
                    styles.margin,
                ]}>
                    <DescriptionBlock
                        title='축제 소개'
                        description={festival.summary}
                    />
                    <DescriptionBlock
                        title='행사 내용'
                        description={festival.program}
                    />
                </View>
                <View style={[
                    styles.usageSection,
                    styles.white,
                    styles.margin,
                ]}>
                    <Text style={styles.title}>이용 안내</Text>
                    <View style={styles.usageBox}>
                        <View style={styles.usageLine}>
                            <Text style={styles.textLeft}>이용시간</Text>
                            <Text style={styles.textRight}>
                                {formatMultilineText(festival.operationHours) || '-'}
                            </Text>
                        </View>
                        <View style={styles.usageLine}>
                            <Text style={styles.textLeft}>휴무일</Text>
                            <Text style={styles.textRight}>
                                {formatMultilineText(festival.restDate) || '-'}
                            </Text>
                        </View>
                        <View style={styles.usageLine}>
                            <Text style={styles.textLeft}>이용료</Text>
                            <Text style={styles.textRight}>
                                {formatMultilineText(festival.useFee) || '-'}
                            </Text>
                        </View>
                        <View style={styles.usageLine}>
                            <Text style={styles.textLeft}>주차시설</Text>
                            <Text style={styles.textRight}>
                                {formatMultilineText(festival.parkingFee) || '-'}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
            <View style={[
                styles.dojangSection,
                styles.white,
                {
                    paddingBottom: Math.max(40, insets.bottom + 14),
                },
            ]}>
                {dojangStatus ? (
                    <DojangTourButton
                        status={dojangStatus}
                        onPress={handleDojangButtonPress}
                    />
                ) : (
                    <ActivityIndicator
                        color={Colors.pink.pink50}
                    />
                )}
            </View>

            <AlertModal
                visible={isStopModalVisible}
                title="투어를 중단하시겠습니까?"
                description="지금까지 수집한 도장이 모두 소멸됩니다."
                cancelText='취소'
                confirmText='중단'
                onClose={() => setIsStopModalVisible(false)}
                onConfirm={handleStopTour}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.gray.gray00,
    },
    white: {
        backgroundColor: Colors.gray.gray00,
    },
    margin: {
        marginTop: 16,
    },
    scrollView: {
        flex: 1,
        backgroundColor: Colors.gray.gray20,
    },
    imageSection: {
        width: '100%',
        height: 260,
    },
    overlay: {
        backgroundColor: 'rgba(38, 38, 38, 0.30)',
    },
    backButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 32,
        height: 32,
        marginHorizontal: 20,
        paddingTop: 4,
    },
    introSection: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 32,
        gap: 20,
    },
    titleBox: {
        gap: 12,
    },
    title: {
        fontFamily: FontFamily.semiBold,
        fontSize: 22,
        color: Colors.gray.gray100,
        lineHeight: 22 * 1.5,
    },
    badgeBox: {
        flexDirection: 'row',
        gap: 6,
    },
    infoBox: {
        gap: Spacing.two,
    },
    textBox: {
        flexDirection: 'row',
        gap: Spacing.two,
    },
    iconBox: {
        width: 24,
        height: 24,
        backgroundColor: Colors.gray.gray20,
        borderRadius: '50%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontFamily: FontFamily.medium,
        fontSize: FontSize.sm,
        color: Colors.gray.gray100,
        lineHeight: FontSize.sm * 1.5,
    },
    underline: {
        textDecorationLine: 'underline',
        textDecorationColor: Colors.gray.gray100,
    },
    descSection: {
        paddingHorizontal: 20,
        paddingVertical: 32,
        gap: 40,
    },
    usageSection: {
        paddingTop: 32,
        paddingBottom: 40,
        paddingHorizontal: 20,
        gap: 8,
    },
    usageBox: {
        gap: 6,
    },
    usageLine: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    textLeft: {
        fontFamily: FontFamily.semiBold,
        fontSize: FontSize.md,
        lineHeight: FontSize.md * 1.5,
        color: Colors.gray.gray70,
    },
    textRight: {
        maxWidth: 180,
        textAlign: 'right',
        fontFamily: FontFamily.semiBold,
        fontSize: FontSize.md,
        lineHeight: FontSize.md * 1.5,
        color: Colors.gray.gray100,
    },
    dojangSection: {
        paddingHorizontal: 20,
        paddingTop: 14,
    },
});