import { ApiError, isRetryableError, NetworkOfflineError } from "@/apis/client";
import { getMyStamps } from "@/apis/stamp";
import { AlertModal } from "@/components/common/AlertModal";
import { ErrorModal } from "@/components/common/ErrorModal";
import { LoadingIndicator } from "@/components/common/LoadingIndicator";
import FestivalMainTitle from "@/components/festival/main/FestivalMainTitle";
import { EmptyIcon } from "@/components/icons/EmptyIcon";
import { InfoIcon } from "@/components/icons/InfoIcon";
import StampItemCard from "@/components/stamp/StampItemCard";
import { Colors, FontFamily, FontSize, Spacing } from "@/constants/theme";
import { TourStampListResult } from "@/types/stamp";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function StampPage() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [myStamps, setMyStamps] = useState<TourStampListResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [failedRequest, setFailedRequest] = useState<{
        retry: () => void;
        isOffline: boolean;
    } | null>(null);
    const [reloadTrigger, setReloadTrigger] = useState(0);
    const [infoError, setInfoError] = useState<string | null>(null);

    const retryFailedRequest = () => {
        const request = failedRequest;

        setFailedRequest(null);
        request?.retry();
    };

    useFocusEffect(
        useCallback(() => {
            let isMounted = true;

            const fetchMyStamp = async () => {
                try {
                    setIsLoading(true);

                    const data = await getMyStamps();

                    if (!isMounted) {
                        return;
                    }

                    setMyStamps(data);
                } catch (error) {
                    console.error('내 스탬프 조회 실패:', error);

                    if (!isMounted) {
                        return;
                    }

                    if (isRetryableError(error)) {
                        setFailedRequest({
                            retry: () =>
                                setReloadTrigger(
                                    (prev) => prev + 1
                                ),
                            isOffline:
                                error instanceof NetworkOfflineError,
                        });
                    } else {
                        setInfoError(
                            error instanceof ApiError
                                ? error.message
                                : '정보를 불러오지 못했어요.',
                        );
                    }
                } finally {
                    if (isMounted) {
                        setIsLoading(false);
                    }
                }
            };

            fetchMyStamp();

            return () => {
                isMounted = false;
            };
        }, [reloadTrigger])
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <LoadingIndicator />
            </View>
        );
    }

    return (
        <View
            style={[
                styles.container,
                {
                    paddingTop: insets.top,
                },
            ]}
        >
            <FestivalMainTitle
                subtitle="도장 현황"
                title={`${myStamps?.rewardedTourCount ?? 0}개의 보상을 받았어요`}
            />
            <View style={styles.rewardInfoBox}>
                <InfoIcon />
                <Text style={styles.rewardInfoText}>보상 수령 방법</Text>
            </View>
            {myStamps?.tours.length ? (
                <FlatList
                    data={myStamps.tours}
                    contentContainerStyle={styles.listContent}
                    keyExtractor={(item) => item.festivalId}
                    renderItem={({ item }) => (
                        <StampItemCard
                            stamp={item}
                            onPress={() => {
                                router.push({
                                    pathname: '/stamp-detail/[id]',
                                    params: {
                                        id: item.festivalId,
                                    },
                                });
                            }}
                        />
                    )}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <EmptyIcon />

                    <View style={styles.emptyTextBox}>
                        <Text style={styles.emptyText}>
                            획득한 도장이 없어요.
                        </Text>
                        <Text style={styles.emptyText}>
                            투어에 참여하고 도장을 모아 보세요.
                        </Text>
                    </View>
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
    container: {
        flex: 1,
        backgroundColor: Colors.gray.gray00,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.gray.gray00,
    },
    rewardInfoBox: {
        backgroundColor: '#FAFAFA',
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 8.5,
        marginVertical: 10,
        alignItems: 'center',
        gap: 2,
    },
    rewardInfoText: {
        color: Colors.gray.gray70,
        fontFamily: FontFamily.medium,
        fontSize: FontSize.sm,
        lineHeight: FontSize.sm * 1.5,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        gap: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyTextBox: {
        paddingTop: Spacing.one,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontFamily: FontFamily.medium,
        fontSize: FontSize.sm,
        lineHeight: FontSize.sm * 1.5,
        color: Colors.gray.gray60,
    },
});