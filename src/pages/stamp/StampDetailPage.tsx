import { getMyStampsDetail } from '@/apis/stamp';
import DefaultFestivalImage from '@/assets/images/festival/common/card-dim-3.png';
import { DojangTourButton } from '@/components/common/DojangTourButton';
import FestivalMainTitle from '@/components/festival/main/FestivalMainTitle';
import { BackIcon } from '@/components/icons/BackIcon';
import { StampDashLineIcon } from '@/components/icons/StampDashLineIcon';
import { StampEmptyIcon } from '@/components/icons/StampEmptyIcon';
import { Colors, FontFamily, FontSize } from '@/constants/theme';
import { MyTourStampDetail } from '@/types/tour';
import { mapStampDetailDojangStatus } from '@/utils/dojangStatus';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  const [isActive, setIsActive] = useState(false);

  const [stampDetail, setStampDetail] =
    useState<MyTourStampDetail | null>(null);

  useEffect(() => {
    const fetchStampDetail = async () => {
      try {
        const data = await getMyStampsDetail(festivalId);

        setStampDetail(data);
      } catch (error) {
        console.error('스탬프 상세 조회 실패:', error);
      }
    };

    fetchStampDetail();
  }, [festivalId]);

  useEffect(() => {
    setImageError(false);
  }, [stampDetail?.festivalImgUrl]);

  if (!stampDetail) {
    return null;
  }

  const dojangStatus = mapStampDetailDojangStatus(
    stampDetail.status,
    stampDetail.stampCount,
  );

  const imageSource =
    stampDetail?.festivalImgUrl && !imageError
      ? { uri: stampDetail.festivalImgUrl }
      : DefaultFestivalImage;

  return (
    <View style={styles.container}>
      <ScrollView
        style={[
          styles.scrollView,
        ]}
        contentContainerStyle={styles.scrollContent}
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
          styles.mainSection
        ]}>
          <View style={styles.titleBox}>
            <Text
              style={styles.title}
              numberOfLines={1}
              ellipsizeMode='tail'
            >{stampDetail.tourName}</Text>
            <Pressable
              style={styles.badge}
              onPress={() => {
                router.push({
                  pathname: '/festival-detail/[id]',
                  params: {
                    id: stampDetail.festivalId,
                  },
                });
              }}
              hitSlop={10}
            >
              <Text style={styles.badgeText}>보기</Text>
            </Pressable>
          </View>
          <View style={styles.mainBox}>
            <FestivalMainTitle
              subtitle='누적 도장'
              title={`${stampDetail.stampCount}개의 도장을 획득했어요`}
              paddingTop={20}
            />
            <View style={styles.stampBox}>
              <View style={styles.stampItem}>
                <View style={styles.stampIconBox}>
                  <StampEmptyIcon
                    color={isActive ? Colors.pink.pink50 : '#DEDEDE'}
                    subColor={isActive ? Colors.pink.pink25 : '#F6F6F6'}
                    fill={isActive ? Colors.pink.pink10 : 'white'}
                  />
                  <StampDashLineIcon
                    color={isActive ? Colors.pink.pink50 : '#DEDEDE'}
                  />
                </View>
                <View style={styles.stampTextBox}>
                  <Text style={styles.stampTitle}>이순신 광장</Text>
                  <Text style={styles.stampUnderText}>2026.09.18 19:16 방문 완료</Text>
                </View>
              </View>
              <View style={styles.stampItem}>
                <View style={styles.stampIconBox}>
                  <StampEmptyIcon
                    color={isActive ? Colors.pink.pink50 : '#DEDEDE'}
                    subColor={isActive ? Colors.pink.pink25 : '#F6F6F6'}
                    fill={isActive ? Colors.pink.pink10 : 'white'}
                  />
                  <StampDashLineIcon
                    color={isActive ? Colors.pink.pink50 : '#DEDEDE'}
                  />
                </View>
                <View style={styles.stampTextBox}>
                  <Text style={styles.stampTitle}>관광지 2</Text>
                  <Text style={styles.stampUnderText}>관광지를 방문하고 도장을 획득해요</Text>
                </View>
              </View>
              <View style={styles.stampItem}>
                <View style={styles.stampIconBox}>
                  <StampEmptyIcon
                    color={isActive ? Colors.pink.pink50 : '#DEDEDE'}
                    subColor={isActive ? Colors.pink.pink25 : '#F6F6F6'}
                    fill={isActive ? Colors.pink.pink10 : 'white'}
                  />
                </View>
                <View style={styles.stampTextBox}>
                  <Text style={styles.stampTitle}>관광지 3</Text>
                  <Text style={styles.stampUnderText}>관광지를 방문하고 도장을 획득해요</Text>
                </View>
              </View>
            </View>
            <View style={styles.infoSection}>
              <View style={styles.infoBox}>
                <Text style={styles.text}>  •  보상 수령을 위한 QR 코드는 축제별 1회만 발급됩니다.</Text>
                <Text style={styles.text}>  •  보상은 부스 운영 시간 내에 수령할 수 있습니다.</Text>
                <Text style={styles.text}>  •  QR 코드는 축제 종료일의 부스 마감 시간까지 유효합니다.</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={[
        styles.dojangSection,
        {
          paddingBottom: Math.max(40, insets.bottom + 14),
        },
      ]}>
        {dojangStatus ? (
          <DojangTourButton
            status={dojangStatus}
          />
        ) : (
          <ActivityIndicator
            color={Colors.pink.pink50}
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray.gray00,
  },
  margin: {
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.gray.gray00,
  },
  scrollContent: {
    flexGrow: 1,
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
  mainSection: {
    flex: 1,
  },
  titleBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#DEDEDE',
    gap: 50,
  },
  title: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.gray.gray100,
    lineHeight: FontSize.md * 1.5,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#F2F9FF'
  },
  badgeText: {
    color: '#2788FF',
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.5,
  },
  mainBox: {

  },
  stampBox: {
    paddingHorizontal: 20,
    paddingVertical: 27,
  },
  stampItem: {
    flexDirection: 'row',
    gap: 12,
  },
  stampIconBox: {
    width: 44,
    alignItems: 'center',
  },
  stampTextBox: {

  },
  stampTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.5,
    color: Colors.gray.gray100,
  },
  stampUnderText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    color: '#5A5A5A'
  },
  infoSection: {
    paddingHorizontal: 20,
  },
  infoBox: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
  },
  textLine: {
    flexDirection: 'row',
  },
  round: {

  },
  text: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: '#5A5A5A',
    lineHeight: 13 * 1.5,
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
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.10)',
  },
});