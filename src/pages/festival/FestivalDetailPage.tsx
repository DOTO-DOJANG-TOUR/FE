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
import { FestivalDetail } from '@/types/festival';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ImageBackground, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
    festivalId: number;
};

// 임시 데이터 - API 연동 시 삭제 예정
const festivals: FestivalDetail[] = [
    {
        id: 1,
        status: 'ongoing',
        imageUrl: 'https://picsum.photos/seed/festival1/800/600',
        title: '거문도백도 은빛바다 체험행사',
        phone: '061-690-7681',
        homeLink: 'https://www.yeosu.go.kr/tour/culture_festa/geomundo',
        region: '전남광주통합특별시 여수시 삼산면 삼호교길 50',
        category: 'EV010100',
        introduction:
            '천년의 시간을 품은 고찰 불갑사와 사계절 아름다운 자연을 간직한 불갑산 자락에 가을의 시작을 알리는 상사화가 다시 피어난다. 제26회를 맞이하는 영광불갑산상사화축제는 붉은 꽃물결 속에서 자연과 사람이 이어지는 특별한 순간으로 관람객을 초대하는 축제이다. 불갑산 일대에 펼쳐진 수백만 송이 상사화 군락을 중심으로 산과 길 곳곳에서 다채로운 프로그램이 운영된다. 낮에는 자연과 꽃이 어우러진 풍경을 감상할 수 있으며, 밤에는 은은한 조명으로 연출된 상사화 야간경관이 또 다른 감동을 선사한다. 공연·전시·체험 프로그램과 캐릭터 ‘상사호’ 이벤트가 더해져 남녀노소 모두가 함께 즐길 수 있는 축제이다. 붉게 물든 상사화 꽃길을 따라 천천히 걸으며 소중한 사람과 추억을 나누고, 분주한 일상에서 벗어나 마음을 쉬어갈 수 있는 시간이다. 자연이 전하는 위로와 설렘, 그리고 사랑의 감성이 머무는 곳이다. 가을이 가장 먼저 피어나는 영광불갑산상사화축제에서 특별한 가을의 시작을 만날 수 있다.',
        eventContent:
            '1. 메인프로그램 : 상사화 꽃길걷기, 상사호 in Love콘서트, 상사화 미디어파사드, 상사화 달빛 야행\n' +
            '2. 부대프로그램 : 상사화 꽃맵시 선발대회, 상사화 대학가요제, 상사화 꽃(金)이 피었습니다. 다문화 모국춤, 도립국악단, 브레드이발소, 도레미 프렌즈, 어린이 트로트 가요제 등\n' +
            '3. 체험, 참여행사 : SNS 인증샷 이벤트, 인생네컷, 상사화 우체통 편지쓰기, 도자기 공예, 천연염색 체험, 원목자개그립톡, 키링&노리개 만들기, 냅킨공예, 비즈팔찌체험, 고무신 상사화그리기, 석고방향제만들기, 상사화 스탬프 엽서 만들기, 영광군 투어(1박2일) , 일년뒤에 받는 엽서 등\n' +
            '4. 부대시설 : 종합안내소, 의료지원반, 119안전체험장, 미아보호센터, 이동식 화장실운영, 휠체어, 유모차 대여, 서틀버스 운행, 휴대폰 보조배터리 충전, 모유수유실, 물품보관함 등',
        usageInfo: {
            operatingHours: '09:00 ~ 20:00',
            closedDays: '연중무휴',
            fee: '무료',
            parking: '가능',
        },
        dojangStatus: 'start',
    },
    {
        id: 2,
        status: 'upcoming',
        imageUrl: undefined,
        title: '김악산 꽃별 여행',
        phone: undefined,
        homeLink: undefined,
        region: undefined,
        category: 'EV010100',
        introduction: undefined,
        eventContent: undefined,
        usageInfo: {
            operatingHours: undefined,
            closedDays: undefined,
            fee: undefined,
            parking: undefined,
        },
        dojangStatus: 'stop',
    },
];

export default function FestivalDetailPage({
    festivalId,
}: Props) {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [imageError, setImageError] = useState(false);
    const [isStopModalVisible, setIsStopModalVisible] = useState(false);

    const festival = festivals.find(
        (item) => item.id === festivalId
    );

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

    const homeLink = festival.homeLink;

    const handleDojangButtonPress = () => {
        if (festival.dojangStatus === 'stop') {
            setIsStopModalVisible(true);
        }
    };

    const handleStopTour = () => {
        // 도장 투어 중단 API 호출 예정

        setIsStopModalVisible(false);
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
                            {festival.region ? (
                                <Text
                                    style={styles.text}
                                    numberOfLines={2}
                                    ellipsizeMode='tail'
                                >{festival.region}</Text>
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
                        description={festival.introduction}
                    />
                    <DescriptionBlock
                        title='행사 내용'
                        description={festival.eventContent}
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
                            {festival.usageInfo?.operatingHours ? (
                                <Text style={styles.textRight}>{festival.usageInfo?.operatingHours}</Text>
                            ) : (
                                <Text style={styles.textRight}>-</Text>
                            )}
                        </View>
                        <View style={styles.usageLine}>
                            <Text style={styles.textLeft}>휴무일</Text>
                            {festival.usageInfo?.closedDays ? (
                                <Text style={styles.textRight}>{festival.usageInfo?.closedDays}</Text>
                            ) : (
                                <Text style={styles.textRight}>-</Text>
                            )}
                        </View>
                        <View style={styles.usageLine}>
                            <Text style={styles.textLeft}>이용료</Text>
                            {festival.usageInfo?.fee ? (
                                <Text style={styles.textRight}>{festival.usageInfo?.fee}</Text>
                            ) : (
                                <Text style={styles.textRight}>-</Text>
                            )}
                        </View>
                        <View style={styles.usageLine}>
                            <Text style={styles.textLeft}>주차시설</Text>
                            {festival.usageInfo?.parking ? (
                                <Text style={styles.textRight}>{festival.usageInfo?.parking}</Text>
                            ) : (
                                <Text style={styles.textRight}>-</Text>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>
            <View style={[
                styles.dojangSection,
                styles.white,
            ]}>
                <DojangTourButton
                    status={festival.dojangStatus}
                    onPress={handleDojangButtonPress}
                />
            </View>

            <AlertModal
                visible={isStopModalVisible}
                title="투어를 중단하시겠습니까?"
                description="지금까지 수집한 도장이 모두 소멸됩니다."
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
        fontFamily: FontFamily.semiBold,
        fontSize: FontSize.md,
        lineHeight: FontSize.md * 1.5,
        color: Colors.gray.gray100,
    },
    dojangSection: {
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 40,
    },
});