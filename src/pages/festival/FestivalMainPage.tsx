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
import { Asset } from 'expo-asset';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TodayFestival = {
    id: number;
    imageUrl?: string;
    title: string;
    startDate: string;
    endDate: string;
    region: string;
};

type UpcomingFestival = {
    id: number;
    imageUrl?: string;
    title: string;
    startDate: string;
    region: string;
};

const regionCategories = [
    {
        id: 1,
        region: '서울',
        image: SeoulImage,
    },
    {
        id: 2,
        region: '경기 · 인천',
        image: gyeongiImage,
    },
    {
        id: 3,
        region: '강원',
        image: GangwonImage,
    },
    {
        id: 4,
        region: '충북',
        image: ChungbukImage,
    },
    {
        id: 5,
        region: '충남권',
        image: ChungnamImage,
    },
    {
        id: 6,
        region: '전북',
        image: JeonbukImage,
    },
    {
        id: 7,
        region: '전남권',
        image: JeonnamImage,
    },
    {
        id: 8,
        region: '경북권',
        image: GyeongbukImage,
    },
    {
        id: 9,
        region: '경남권',
        image: GyeongnamImage,
    },
    {
        id: 10,
        region: '제주',
        image: JejuImage,
    },
]

// 임시 데이터 - API 연동 시 삭제 예정
const todayFestivals: TodayFestival[] = [
    {
        id: 1,
        imageUrl: 'https://picsum.photos/seed/festival1/400/600',
        title: '김악산 꽃별 여행 김악산 김악산 꽃별 여행 김악산',
        startDate: '2026.9.18',
        endDate: '2026.10.11',
        region: '거창군',
    },
    {
        id: 2,
        imageUrl: 'https://picsum.photos/seed/festival2/400/600',
        title: '영광불갑산상사화축제',
        startDate: '2026.9.18',
        endDate: '2026.09.27',
        region: '영광군',
    },
    {
        id: 3,
        imageUrl: undefined,
        title: '김악산 꽃별 여행 김악산 김악산 꽃별 여행 김악산',
        startDate: '2026.9.18',
        endDate: '2026.10.11',
        region: '거창군',
    },
    {
        id: 4,
        imageUrl: undefined,
        title: '영광불갑산상사화축제',
        startDate: '2026.9.18',
        endDate: '2026.09.27',
        region: '영광군',
    },
];

const upcomingFestivals: UpcomingFestival[] = [
    {
        id: 1,
        imageUrl: 'https://picsum.photos/seed/festival1/400/600',
        title: '경남고성공룡세계엑스포',
        startDate: '2026.9.18',
        region: '고성군',
    },
    {
        id: 2,
        imageUrl: 'https://picsum.photos/seed/festival2/400/600',
        title: '수원화성미디어아트',
        startDate: '2026.8.30',
        region: '수원시',
    },
    {
        id: 3,
        imageUrl: undefined,
        title: '세계유산축전',
        startDate: '2026.10.02',
        region: '안동시',
    },
];

export const FestivalMainPage = () => {
    const insets = useSafeAreaInsets();
    const [isLoading, setIsLoading] = useState(true);

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

            const remoteImages = [
                ...todayFestivals.map((festival) => festival.imageUrl),
                ...upcomingFestivals.map((festival) => festival.imageUrl),
            ].filter((url): url is string => Boolean(url));

            try {
                await Promise.allSettled([
                    Asset.loadAsync(localImages),
                    ...remoteImages.map((url) => Image.prefetch(url)),
                ]);
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
                    {hasTodayFestivals ? (
                        <FlatList
                            data={todayFestivals}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.list}
                            contentContainerStyle={styles.horizontalListContent}
                            keyExtractor={(item) => String(item.id)}
                            renderItem={({ item }) => (
                                <TodayFestivalCard
                                    imageUrl={item.imageUrl}
                                    title={item.title}
                                    startDate={item.startDate}
                                    endDate={item.endDate}
                                    region={item.region}
                                />
                            )}
                            ItemSeparatorComponent={() => (
                                <View style={{ width: 10 }} />
                            )}
                        />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <EmptyIcon />

                            <Text style={styles.emptyText}>
                                투어 가능한 축제가 없어요
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
                                />
                            ))}
                        </View>
                    </View>
                </View>
                <View style={styles.festivalSection}>
                    <FestivalMainTitle
                        title="곧 개최 예정인 축제"
                    />
                    {hasUpcomingFestivals ? (
                        <FlatList
                            data={upcomingFestivals}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.list}
                            contentContainerStyle={styles.horizontalListContent}
                            keyExtractor={(item) => String(item.id)}
                            renderItem={({ item }) => (
                                <UpcomingFestivalCard
                                    imageUrl={item.imageUrl}
                                    title={item.title}
                                    startDate={item.startDate}
                                    region={item.region}
                                />
                            )}
                            ItemSeparatorComponent={() => (
                                <View style={{ width: 10 }} />
                            )}
                        />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <EmptyIcon />

                            <Text style={styles.emptyText}>
                                개최 예정인 축제가 없어요
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
    },
    horizontalPadding: {
        paddingHorizontal: 20,
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
