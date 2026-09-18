import { ApiError, isRetryableError, NetworkOfflineError } from '@/apis/client';
import { getMyStampsDetail, getRewardQr } from '@/apis/stamp';
import DefaultFestivalImage from '@/assets/images/festival/common/card-dim-3.png';
import { AlertModal } from '@/components/common/AlertModal';
import { DojangTourButton } from '@/components/common/DojangTourButton';
import { ErrorModal } from '@/components/common/ErrorModal';
import { PageLoadingIndicator } from '@/components/common/PageLoadingIndicator';
import FestivalMainTitle from '@/components/festival/main/FestivalMainTitle';
import { BackIcon } from '@/components/icons/BackIcon';
import { StampDashLineIcon } from '@/components/icons/StampDashLineIcon';
import { StampEmptyIcon } from '@/components/icons/StampEmptyIcon';
import StampQrModal from '@/components/stamp/StampQrModal';
import { Colors, FontFamily, FontSize } from '@/constants/theme';
import { MyTourStampDetail } from '@/types/stamp';

import { formatCompletedAt } from '@/utils/date';
import { mapStampDetailDojangStatus } from '@/utils/dojangStatus';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  festivalId: string;
};

export default function FestivalDetailPage({
  festivalId,
}: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // 이 화면은 방문 인증 완료 화면(체크인)에서 도장 획득 직후 이동해오는 경우와, 도장
  // 탭 목록에서 카드를 눌러 들어오는 경우 둘 다 있다. 체크인 쪽은 라우팅 가드가 스택을
  // 갈아치우는 화면이라 canGoBack()이 true여도 실제로는 낡은(값이 비워진) 체크인
  // 화면으로 튕기는 경우가 있어(#92), 뒤로가기는 항상 도장 탭으로 명시 이동한다 —
  // 목록에서 들어온 경우도 어차피 그 목록 화면이 도장 탭이라 결과는 같다.
  const navigateBack = () => router.replace('/(tabs)/stamp');

  /**useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        navigateBack();
        return true;
      });
      return () => subscription.remove();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );**/

  const [pageLoading, setPageLoading] = useState(true);
  const [failedImageUri, setFailedImageUri] = useState<string | undefined>();

  const [stampDetail, setStampDetail] =
    useState<MyTourStampDetail | null>(null);

  const [rewardQrImage, setRewardQrImage] = useState<string | null>(null);
  const [rewardCode, setRewardCode] =
    useState<string | null>(null);
  const [rewardModalVisible, setRewardModalVisible] = useState(false);
  const [isRewardLoading, setIsRewardLoading] = useState(false);

  const [failedRequest, setFailedRequest] = useState<{
    retry: () => void;
    isOffline: boolean;
  } | null>(null);

  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [infoError, setInfoError] =
    useState<string | null>(null);
  const retryFailedRequest = () => {
    const request = failedRequest;

    setFailedRequest(null);
    request?.retry();
  };

  useEffect(() => {
    let isMounted = true;

    const fetchStampDetail = async () => {
      try {
        setPageLoading(true);
        setFailedRequest(null);
        setInfoError(null);
        const data = await getMyStampsDetail(festivalId);

        if (!isMounted) {
          return;
        }

        setStampDetail(data);
      } catch (error) {
        console.error('스탬프 상세 조회 실패:', error);

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
        if (isMounted) setPageLoading(false);
      }
    };

    fetchStampDetail();

    return () => {
      isMounted = false;
    };
  }, [festivalId, reloadTrigger]);

  useEffect(() => {
    if (!rewardModalVisible) {
      return;
    }

    const interval = setInterval(() => {
      refreshStampDetail();
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [rewardModalVisible, festivalId]);

  if (pageLoading || !stampDetail) {
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
          onCancel={() => { setFailedRequest(null); navigateBack(); }}
          onRetry={retryFailedRequest}
        />

        <AlertModal
          visible={infoError !== null}
          title="오류"
          description={infoError ?? ''}
          confirmText="확인"
          onClose={() => { setInfoError(null); navigateBack(); }}
          onConfirm={() => { setInfoError(null); navigateBack(); }}
        />
      </View>
    );
  }

  const dojangStatus = mapStampDetailDojangStatus(
    stampDetail.status,
  );

  const imageSource =
    stampDetail?.festivalImgUrl && failedImageUri !== stampDetail?.festivalImgUrl
      ? { uri: stampDetail.festivalImgUrl }
      : DefaultFestivalImage;

  const handleRewardPress = async () => {
    try {
      setIsRewardLoading(true);

      const data = await getRewardQr(festivalId);

      setRewardQrImage(data.qrCodeImageUrl);
      setRewardCode(data.rewardCode);
      setRewardModalVisible(true);
    } catch (error) {
      console.error('보상 QR 조회 실패:', error);

      if (isRetryableError(error)) {
        setFailedRequest({
          retry: handleRewardPress,
          isOffline:
            error instanceof NetworkOfflineError,
        });
      } else {
        setInfoError(
          error instanceof ApiError
            ? error.message
            : '보상 QR을 불러오지 못했어요.',
        );
      }
    } finally {
      setIsRewardLoading(false);
    }
  };

  const refreshStampDetail = async () => {
    try {
      const data =
        await getMyStampsDetail(festivalId);

      setStampDetail(data);

      if (data.status === 'REWARDED') {
        setRewardModalVisible(false);

        router.replace({
          pathname: '/reward-complete',
          params: {
            festivalId,
          },
        });
      }
    } catch (error) {
      console.error(
        '보상 상태 확인 실패:',
        error
      );
    }
  };

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
          onError={() => setFailedImageUri(stampDetail.festivalImgUrl)}
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
            onPress={navigateBack}
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
                    from: 'stamp',
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
              {Array.from({ length: 3 }).map((_, index) => {
                const stamp = stampDetail.stamps[index];
                const isStampActive = !!stamp;
                const isDashActive = !!stampDetail.stamps[index + 1];

                return (
                  <View
                    key={index}
                    style={styles.stampItem}
                  >
                    <View style={styles.stampIconBox}>
                      <StampEmptyIcon
                        color={
                          isStampActive
                            ? Colors.pink.pink50
                            : '#DEDEDE'
                        }
                        subColor={
                          isStampActive
                            ? Colors.pink.pink25
                            : '#F6F6F6'
                        }
                        fill={
                          isStampActive
                            ? Colors.pink.pink10
                            : 'white'
                        }
                      />

                      {index < 2 && (
                        <StampDashLineIcon
                          color={
                            isDashActive
                              ? Colors.pink.pink50
                              : '#DEDEDE'
                          }
                        />
                      )}
                    </View>

                    <View style={styles.stampTextBox}>
                      <Text style={styles.stampTitle}>
                        {stamp?.tourSpotName ?? `관광지 ${index + 1}`}
                      </Text>

                      <Text style={styles.stampUnderText}>
                        {stamp
                          ? `${formatCompletedAt(stamp.stampedAt)} 방문 완료`
                          : '관광지를 방문하고 도장을 획득해요'}
                      </Text>
                    </View>
                  </View>
                );
              })}
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
        {isRewardLoading ? (
          <ActivityIndicator color={Colors.pink.pink50} />
        ) : dojangStatus ? (
          <DojangTourButton
            status={dojangStatus}
            onPress={() => {
              if (dojangStatus === 'getReward') {
                handleRewardPress();
              }
            }}
          />
        ) : (
          <ActivityIndicator color={Colors.pink.pink50} />
        )}
      </View>
      {rewardQrImage && rewardCode && (
        <StampQrModal
          visible={rewardModalVisible}
          qrImage={rewardQrImage}
          rewardCode={rewardCode}
          onClose={() => setRewardModalVisible(false)}
        />
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
        onCancel={() =>
          setFailedRequest(null)
        }
        onRetry={retryFailedRequest}
      />

      <AlertModal
        visible={infoError !== null}
        title="오류"
        description={infoError ?? ''}
        confirmText="확인"
        onClose={() =>
          setInfoError(null)
        }
        onConfirm={() =>
          setInfoError(null)
        }
      />
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
  margin: {
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.gray.gray00,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
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
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#DEDEDE',
    gap: 30,
  },
  title: {
    flex: 1,
    minWidth: 0,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.gray.gray100,
    lineHeight: FontSize.md * 1.5,
  },
  badge: {
    flexShrink: 0,
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