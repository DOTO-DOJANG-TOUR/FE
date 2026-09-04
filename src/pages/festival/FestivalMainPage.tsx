import { getTodayFestivals, getUpcomingFestivals } from '@/apis/festival';
import ChungbukImage from '@/assets/images/festival/main/festival-main-chungbuk.jpg';
import ChungnamImage from '@/assets/images/festival/main/festival-main-chungnam.jpg';
import GangwonImage from '@/assets/images/festival/main/festival-main-gangwon.jpg';
import GyeongbukImage from '@/assets/images/festival/main/festival-main-gyeongbuk.jpg';
import gyeongiImage from '@/assets/images/festival/main/festival-main-gyeongi.jpg';
import GyeongnamImage from '@/assets/images/festival/main/festival-main-gyeongnam.jpg';
import JejuImage from '@/assets/images/festival/main/festival-main-jeju.jpg';
import JeonbukImage from '@/assets/images/festival/main/festival-main-jeonbuk.jpg';
import JeonnamImage from '@/assets/images/festival/main/festival-main-jeonnam.jpg';
import SeoulImage from '@/assets/images/festival/main/festival-main-seoul.jpg';
import FestivalMainHeader from "@/components/festival/main/FestivalMainHeader";
import FestivalMainTitle from "@/components/festival/main/FestivalMainTitle";
import RegionCategoryCard from "@/components/festival/main/RegionCategoryCard";
import TodayFestivalCard from "@/components/festival/main/TodayFestivalCard";
import UpcomingFestivalCard from '@/components/festival/main/UpcomingFestivalCard';
import { EmptyIcon } from '@/components/icons/EmptyIcon';
import { Colors, FontFamily, FontSize, Spacing } from "@/constants/theme";
import { Festival } from '@/types/festival';
import { Asset } from 'expo-asset';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const regionCategories = [
    {
        id: 1,
        region: '서울',
        regionGroup: 'SEOUL',
        image: SeoulImage,
    },
    {
        id: 2,
        region: '경기 · 인천',
        regionGroup: 'GYEONGGI_INCHEON',
        image: gyeongiImage,
    },
    {
        id: 3,
        region: '강원',
        regionGroup: 'GANGWON',
        image: GangwonImage,
    },
    {
        id: 4,
        region: '충북',
        regionGroup: 'CHUNGBUK',
        image: ChungbukImage,
    },
    {
        id: 5,
        region: '충남권',
        regionGroup: 'CHUNGNAM',
        image: ChungnamImage,
    },
    {
        id: 6,
        region: '전북',
        regionGroup: 'JEONBUK',
        image: JeonbukImage,
    },
    {
        id: 7,
        region: '전남권',
        regionGroup: 'JEONNAM',
        image: JeonnamImage,
    },
    {
        id: 8,
        region: '경북권',
        regionGroup: 'GYEONGBUK',
        image: GyeongbukImage,
    },
    {
        id: 9,
        region: '경남권',
        regionGroup: 'GYEONGNAM',
        image: GyeongnamImage,
    },
    {
        id: 10,
        region: '제주',
        regionGroup: 'JEJU',
        image: JejuImage,
    },
]

export const FestivalMainPage = () => {
    const insets = useSafeAreaInsets();
    const [isLoading, setIsLoading] = useState(true);
    const [isTodayLoading, setIsTodayLoading] =
        useState(true);
    const [isUpcomingLoading, setIsUpcomingLoading] =
        useState(true);
    const router = useRouter();
    const [todayFestivals, setTodayFestivals] =
        useState<Festival[]>([]);
    const [upcomingFestivals, setUpcomingFestivals] =
        useState<Festival[]>([]);
    const [todayNextCursor, setTodayNextCursor] =
        useState<string | null>(null);
    const [upcomingNextCursor, setUpcomingNextCursor] =
        useState<string | null>(null);
    const [isFetchingTodayMore, setIsFetchingTodayMore] =
        useState(false);
    const [isFetchingUpcomingMore, setIsFetchingUpcomingMore] =
        useState(false);


    const hasTodayFestivals = todayFestivals.length > 0;
    const hasUpcomingFestivals = upcomingFestivals.length > 0;

    useEffect(() => {
        let isMounted = true;

        const preloadImages = async () => {
            const localImages = [
                SeoulImage,
                gyeongiImage,
                GangwonImage,
                ChungbukImage,
                ChungnamImage,
                JeonbukImage,
                JeonnamImage,
                GyeongbukImage,
                GyeongnamImage,
                JejuImage,
            ];

            try {
                await Asset.loadAsync(localImages);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        preloadImages();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        const fetchTodayFestivals = async () => {
            try {
                setIsTodayLoading(true);

                const result = await getTodayFestivals();

                const imageUrls = result.festivals
                    .map((festival) => festival.imageUrl)
                    .filter((url): url is string => Boolean(url));

                await Promise.allSettled(
                    imageUrls.map((url) => Image.prefetch(url))
                );

                if (isMounted) {
                    setTodayFestivals(result.festivals);
                    setTodayNextCursor(result.nextCursor ?? null);
                }
            } catch (error) {
                console.error(
                    '오늘의 축제 조회 실패:',
                    error
                );
            } finally {
                if (isMounted) {
                    setIsTodayLoading(false);
                }
            }
        };

        fetchTodayFestivals();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        const fetchUpcomingFestivals = async () => {
            try {
                setIsUpcomingLoading(true);

                const result = await getUpcomingFestivals();

                const imageUrls = result.festivals
                    .map((festival) => festival.imageUrl)
                    .filter((url): url is string => Boolean(url));

                await Promise.allSettled(
                    imageUrls.map((url) => Image.prefetch(url))
                );

                if (isMounted) {
                    setUpcomingFestivals(result.festivals);
                    setUpcomingNextCursor(
                        result.nextCursor ?? null
                    );
                }
            } catch (error) {
                console.error(
                    '개최 예정 축제 조회 실패:',
                    error
                );
            } finally {
                if (isMounted) {
                    setIsUpcomingLoading(false);
                }
            }
        };

        fetchUpcomingFestivals();

        return () => {
            isMounted = false;
        };
    }, []);

    const fetchMoreTodayFestivals = async () => {
        if (!todayNextCursor || isFetchingTodayMore) {
            return;
        }

        try {
            setIsFetchingTodayMore(true);

            const result = await getTodayFestivals(
                todayNextCursor
            );

            const imageUrls = result.festivals
                .map((festival) => festival.imageUrl)
                .filter((url): url is string => Boolean(url));

            await Promise.allSettled(
                imageUrls.map((url) => Image.prefetch(url))
            );

            setTodayFestivals((prev) => [
                ...prev,
                ...result.festivals,
            ]);

            setTodayNextCursor(
                result.nextCursor ?? null
            );
        } catch (error) {
            console.error(
                '오늘의 축제 추가 조회 실패:',
                error
            );
        } finally {
            setIsFetchingTodayMore(false);
        }
    };

    const fetchMoreUpcomingFestivals = async () => {
        if (
            !upcomingNextCursor ||
            isFetchingUpcomingMore
        ) {
            return;
        }

        try {
            setIsFetchingUpcomingMore(true);

            const result = await getUpcomingFestivals(
                upcomingNextCursor
            );

            const imageUrls = result.festivals
                .map((festival) => festival.imageUrl)
                .filter((url): url is string => Boolean(url));

            await Promise.allSettled(
                imageUrls.map((url) => Image.prefetch(url))
            );

            setUpcomingFestivals((prev) => [
                ...prev,
                ...result.festivals,
            ]);

            setUpcomingNextCursor(
                result.nextCursor ?? null
            );
        } catch (error) {
            console.error(
                '개최 예정 축제 추가 조회 실패:',
                error
            );
        } finally {
            setIsFetchingUpcomingMore(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color={Colors.pink.pink50} />
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
            <FestivalMainHeader />
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.festivalSection}>
                    <FestivalMainTitle
                        subtitle="오늘의 축제"
                        title={hasTodayFestivals ? "지금 도장 투어 가능해요" : undefined}
                    />
                    {isTodayLoading ? (
                        <ActivityIndicator
                            color={Colors.pink.pink50}
                        />
                    ) : hasTodayFestivals ? (
                        <FlatList
                            data={todayFestivals}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.list}
                            contentContainerStyle={styles.horizontalListContent}
                            keyExtractor={(item) => String(item.festivalId)}
                            renderItem={({ item }) => (
                                <TodayFestivalCard
                                    imageUrl={item.imageUrl}
                                    title={item.title}
                                    startDate={item.eventStartDate}
                                    endDate={item.eventEndDate}
                                    region={item.gunguName}
                                    onPress={() =>
                                        router.push({
                                            pathname: '/festival-detail/[id]',
                                            params: { id: String(item.festivalId) },
                                        })
                                    }
                                />
                            )}
                            ItemSeparatorComponent={() => (
                                <View style={{ width: 10 }} />
                            )}
                            onEndReached={fetchMoreTodayFestivals}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={
                                isFetchingTodayMore ? (
                                    <View style={styles.horizontalLoading}>
                                        <ActivityIndicator
                                            color={Colors.pink.pink50}
                                        />
                                    </View>
                                ) : null
                            }
                        />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <EmptyIcon />

                            <Text style={styles.emptyText}>
                                투어 가능한 축제가 없어요.
                            </Text>
                        </View>
                    )}
                </View>
                <View style={styles.festivalSection}>
                    <FestivalMainTitle
                        subtitle="전국 축제 정보"
                        title="지역별로 탐색하기"
                    />
                    <View style={[styles.list, styles.horizontalPadding]}>
                        <View style={styles.regionSection}>
                            {regionCategories.map((item) => (
                                <RegionCategoryCard
                                    key={item.id}
                                    image={item.image}
                                    region={item.region}
                                    onPress={() =>
                                        router.push({
                                            pathname: '/festival/region',
                                            params: {
                                                subtitle: '지역별 축제',
                                                title: item.region,
                                                regionGroup: item.regionGroup,
                                            },
                                        })
                                    }
                                />
                            ))}
                        </View>
                    </View>
                </View>
                <View style={styles.festivalSection}>
                    <FestivalMainTitle
                        title="곧 개최 예정인 축제"
                    />
                    {isUpcomingLoading ? (
                        <ActivityIndicator
                            color={Colors.pink.pink50}
                        />
                    ) : hasUpcomingFestivals ? (
                        <FlatList
                            data={upcomingFestivals}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.list}
                            contentContainerStyle={styles.horizontalListContent}
                            keyExtractor={(item) => String(item.festivalId)}
                            renderItem={({ item }) => (
                                <UpcomingFestivalCard
                                    imageUrl={item.imageUrl}
                                    title={item.title}
                                    startDate={item.eventStartDate}
                                    region={item.gunguName}
                                    onPress={() =>
                                        router.push({
                                            pathname: '/festival-detail/[id]',
                                            params: { id: String(item.festivalId) },
                                        })
                                    }
                                />
                            )}
                            ItemSeparatorComponent={() => (
                                <View style={{ width: 10 }} />
                            )}
                            onEndReached={fetchMoreUpcomingFestivals}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={
                                isFetchingUpcomingMore ? (
                                    <View style={styles.horizontalLoading}>
                                        <ActivityIndicator
                                            color={Colors.pink.pink50}
                                        />
                                    </View>
                                ) : null
                            }
                        />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <EmptyIcon />

                            <Text style={styles.emptyText}>
                                개최 예정인 축제가 없어요.
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView >
        </View>
    )
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.gray.gray00,
    },
    container: {
        flex: 1,
        backgroundColor: Colors.gray.gray00,
    },
    scrollView: {
        flex: 1,
    },
    festivalSection: {
        paddingBottom: 40,
    },
    list: {
        paddingTop: 12,
    },
    horizontalListContent: {
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    horizontalPadding: {
        paddingHorizontal: 20,
    },
    horizontalLoading: {
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        paddingTop: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        paddingTop: Spacing.one,
        fontFamily: FontFamily.medium,
        fontSize: FontSize.sm,
        lineHeight: FontSize.sm * 1.5,
        color: Colors.gray.gray60,
    },
    regionSection: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 11,
        rowGap: 12,
    }
});
