import { ApiError, isRetryableError, NetworkOfflineError } from '@/apis/client';
import { getFestivalDetail, getFestivalDojangTourStatus } from '@/apis/festival';
import { startStampTour, stopStampTour } from '@/apis/stamp';
import DefaultFestivalImage from '@/assets/images/festival/common/card-dim-3.png';
import { AlertModal } from '@/components/common/AlertModal';
import { DojangTourButton } from '@/components/common/DojangTourButton';
import { ErrorModal } from '@/components/common/ErrorModal';
import { FestivalCategoryBadge } from '@/components/common/FestivalCategoryBadge';
import { FestivalStatusBadge } from '@/components/common/FestivalStatusBadge';
import { PageLoadingIndicator } from '@/components/common/PageLoadingIndicator';
import DescriptionBlock from '@/components/festival/detail/DescriptionBlock';
import { BackIcon } from '@/components/icons/BackIcon';
import { LocationIcon } from '@/components/icons/LocationIcon';
import { PhoneIcon } from '@/components/icons/PhoneIcon';
import { WebIcon } from '@/components/icons/WebIcon';
import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';
import { useCurrentLocation } from '@/hooks/use-current-location';
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
    const [pageLoading, setPageLoading] = useState(true);
    const [failedImageUri, setFailedImageUri] = useState<string | undefined>();
    const [isStopModalVisible, setIsStopModalVisible] = useState(false);
    // 투어 시작 API 응답을 기다리는 동안(+탭 이동 전까지) 화면이 멈춘 것처럼 보이지 않도록
    // 페이지 전체를 로딩으로 덮는다.
    const [isStartingTour, setIsStartingTour] = useState(false);
    const {
        requestLocation,
    } = useCurrentLocation();

    const [failedRequest, setFailedRequest] = useState<{
        retry: () => void;
        isOffline: boolean;
    } | null>(null);
    const [reloadTrigger, setReloadTrigger] = useState(0);
    const [infoError, setInfoError] = useState<string | null>(null);

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

    const retryFailedRequest = () => {
        const request = failedRequest;
        setFailedRequest(null);
        request?.retry();
    };

    useEffect(() => {
        let isMounted = true;

        const fetchFestivalDetail = async () => {
            try {
                setPageLoading(true);
                setFailedRequest(null);
                setInfoError(null);
                const data = await getFestivalDetail(festivalId);

                if (isMounted) setFestival(data);
            } catch (error) {
                console.error('축제 상세 조회 실패:', error);

                if (!isMounted) {
                    return;
                }

                if (isRetryableError(error)) {
                    setFailedRequest({
                        retry: () => setReloadTrigger((prev) => prev + 1),
                        isOffline: error instanceof NetworkOfflineError,
                    });
                } else {
                    setInfoError(
                        error instanceof ApiError
                            ? error.message
                            : '정보를 불러오지 못했어요.',
                    );
                }
            } finally {
                if (isMounted) setPageLoading(false);
            }
        };

        fetchFestivalDetail();

        return () => {
            isMounted = false;
        };
    }, [festivalId, reloadTrigger]);

    useEffect(() => {
        let isMounted = true;

        const fetchDojangStatus = async () => {
            try {
                const data =
                    await getFestivalDojangTourStatus(festivalId);

                if (isMounted) setDojangStatus(
                    mapDojangTourStatus(data.status)
                );
            } catch (error) {
                console.error(
                    '도장투어 상태 조회 실패:',
                    error
                );

                if (!isMounted) {
                    return;
                }

                if (isRetryableError(error)) {
                    setFailedRequest({
                        retry: () => setReloadTrigger((prev) => prev + 1),
                        isOffline: error instanceof NetworkOfflineError,
                    });
                } else {
                    setInfoError(
                        error instanceof ApiError
                            ? error.message
                            : '정보를 불러오지 못했어요.',
                    );
                }
            }
        };

        fetchDojangStatus();

        return () => {
            isMounted = false;
        };
    }, [festivalId, reloadTrigger]);

    if (pageLoading || !festival) {
        return (
            <View style={styles.container}>
                {pageLoading && (
                    <View style={styles.loadingContainer}>
                        <PageLoadingIndicator />
                    </View>
                )}

                <ErrorModal
                    visible={failedRequest !== null}
                    title={
                        failedRequest?.isOffline
                            ? '오프라인 상태예요'
                            : undefined
                    }
                    description={
                        failedRequest?.isOffline
                            ? '인터넷 연결을 확인한 후 다시 시도해 주세요.'
                            : undefined
                    }
                    onCancel={() => { setFailedRequest(null); router.back(); }}
                    onRetry={retryFailedRequest}
                />

                <AlertModal
                    visible={infoError !== null}
                    title="오류"
                    description={infoError ?? ''}
                    confirmText="확인"
                    onClose={() => { setInfoError(null); router.back(); }}
                    onConfirm={() => { setInfoError(null); router.back(); }}
                />
            </View>
        );
    }

    const imageSource =
        festival.imageUrl && failedImageUri !== festival?.imageUrl
            ? { uri: festival.imageUrl }
            : DefaultFestivalImage;

    const homeLink = festival.homepageUrl
        ? festival.homepageUrl.startsWith('http://') ||
            festival.homepageUrl.startsWith('https://')
            ? festival.homepageUrl
            : `https://${festival.homepageUrl}`
        : null;

    const handleOpenHomepage = async () => {
        if (!homeLink) {
            return;
        }

        try {
            await Linking.openURL(homeLink);
        } catch (error) {
            console.error('홈페이지 열기 실패:', error);
        }
    };

    const refreshDojangStatus = async () => {
        try {
            const data =
                await getFestivalDojangTourStatus(festivalId);

            setDojangStatus(
                mapDojangTourStatus(data.status),
            );
        } catch (error) {
            console.error(
                '도장투어 상태 재조회 실패:',
                error
            );
        }
    };

    const handleStartTour = async () => {
        setIsStartingTour(true);

        try {
            try {
                await startStampTour(festivalId);
            } catch (error) {
                console.error(
                    '스탬프 투어 시작 실패:',
                    error
                );

                if (isRetryableError(error)) {
                    setFailedRequest({
                        retry: handleStartTour,
                        isOffline:
                            error instanceof NetworkOfflineError,
                    });
                } else {
                    setInfoError(
                        error instanceof ApiError
                            ? error.message
                            : '스탬프 투어를 시작하지 못했어요.',
                    );
                }

                return;
            }

            // 투어 시작은 이미 서버에 반영됐으므로, 이후 상태 재조회가 실패하더라도 이동은
            // 그대로 진행한다. GET /api/v1/stamp-tour가 festivalId 없이도 현재 진행 중인
            // 투어를 내려주므로 파라미터 없이 이동해도 Tour 탭이 알아서 다시 조회한다.
            router.push('/(tabs)/tour');

            await refreshDojangStatus();
        } finally {
            setIsStartingTour(false);
        }
    };

    const handleDojangButtonPress = async () => {
        if (dojangStatus === 'start') {
            // 거부하거나 실패해도 투어 시작 가능
            try {
                await requestLocation();
            } catch (error) {
                console.warn(
                    '위치 권한 요청 실패:',
                    error
                );
            }

            await handleStartTour();
            return;
        }

        if (dojangStatus === 'stop') {
            setIsStopModalVisible(true);
        }
    };

    const handleStopTour = async () => {
        try {
            await stopStampTour(festivalId);
        } catch (error) {
            console.error(
                '스탬프 투어 중단 실패:',
                error
            );

            setIsStopModalVisible(false);

            if (isRetryableError(error)) {
                setFailedRequest({
                    retry: handleStopTour,
                    isOffline:
                        error instanceof NetworkOfflineError,
                });
            } else {
                setInfoError(
                    error instanceof ApiError
                        ? error.message
                        : '스탬프 투어를 중단하지 못했어요.',
                );
            }

            return;
        }

        setIsStopModalVisible(false);

        await refreshDojangStatus();
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
                    onError={() => setFailedImageUri(festival.imageUrl)}
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
                        <Text
                            style={styles.title}
                        >{festival.title}</Text>
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
                                <Pressable onPress={handleOpenHomepage}>
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
                            <Text style={styles.textLeft}>축제기간</Text>
                            <Text style={styles.textRight}>
                                {festival.eventPeriod || '-'}
                            </Text>
                        </View>
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
                        loading={isStartingTour}
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
                description="지금까지 획득한 도장이 모두 소멸됩니다."
                cancelText='취소'
                confirmText='중단'
                onClose={() => setIsStopModalVisible(false)}
                onConfirm={handleStopTour}
            />
            <ErrorModal
                visible={failedRequest !== null}
                title={failedRequest?.isOffline ? '오프라인 상태예요' : undefined}
                description={
                    failedRequest?.isOffline
                        ? '인터넷 연결을 확인한 후 다시 시도해 주세요.'
                        : undefined
                }
                onCancel={() => setFailedRequest(null)}
                onRetry={retryFailedRequest}
            />
            <AlertModal
                visible={infoError !== null}
                title="오류"
                description={infoError ?? ''}
                confirmText="확인"
                onClose={() => setInfoError(null)}
                onConfirm={() => setInfoError(null)}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
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
        maxWidth: 210,
        textAlign: 'right',
        fontFamily: FontFamily.semiBold,
        fontSize: FontSize.md,
        lineHeight: FontSize.md * 1.5,
        color: Colors.gray.gray100,
    },
    dojangSection: {
        paddingHorizontal: 20,
        paddingTop: 14,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.10)',
    },
});