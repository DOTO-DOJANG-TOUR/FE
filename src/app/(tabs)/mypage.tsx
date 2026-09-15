import { getMyProfile, withdrawMembership } from '@/apis/members';
import { AlertModal } from '@/components/common/AlertModal';
import { ErrorModal } from '@/components/common/ErrorModal';
import { ProfileEmptyIcon } from '@/components/icons';
import { Colors, FontFamily, FontSize } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { ApiError, isRetryableError, NetworkOfflineError } from '@/apis/client';
import type { Member } from '@/types/auth';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const POLICY_ITEMS = [
  { label: '이용 약관', url: 'https://doto-stamptour.notion.site/tos?source=copy_link' },
  { label: '개인정보 취급방침', url: 'https://doto-stamptour.notion.site/privacy-policy' },
];

export default function MyPageScreen() {
  const authUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const [isWithdrawalModalVisible, setIsWithdrawalModalVisible] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // 서버가 내려준 profile_img가 있어도 실제 로드가 실패하면(카카오 기본 이미지 URL 만료 등)
  // 빈 화면 대신 기본 아이콘으로 대체하기 위한 상태.
  const [profileImageFailed, setProfileImageFailed] = useState(false);

  // 서버가 내려준 4xx 메시지를 그대로 보여주는 용도(재시도 대상 아님)
  const [infoError, setInfoError] = useState<string | null>(null);
  // 재시도 버튼을 누르면 실패했던 요청을 그대로 다시 실행한다(오프라인/5xx/타임아웃 등).
  const [failedRequest, setFailedRequest] = useState<{
    retry: () => void;
    isOffline: boolean;
  } | null>(null);

  const nickname = member?.nickname ?? authUser?.nickname ?? '';

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const result = await getMyProfile();
        if (isMounted) {
          setMember(result);
          setProfileImageFailed(false);
        }
      } catch (error) {
        console.error('내 정보 조회 실패:', error);
        if (isMounted) {
          if (isRetryableError(error)) {
            setFailedRequest({
              retry: () => setReloadTrigger((prev) => prev + 1),
              isOffline: error instanceof NetworkOfflineError,
            });
          } else {
            setInfoError(
              error instanceof ApiError ? error.message : '정보를 불러오지 못했어요.',
            );
          }
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [reloadTrigger]);

  const confirmWithdrawal = async () => {
    try {
      setIsWithdrawing(true);
      await withdrawMembership();
      setIsWithdrawalModalVisible(false);
      // 로컬 정리(clearAuthStorage 등)가 실패하더라도 서버 탈퇴는 이미 끝났으므로
      // 화면 전환을 먼저 보장하는 logout()을 쓴다(expireSession은 정리를 기다린 뒤 전환한다).
      await logout();
    } catch (error) {
      console.error('회원탈퇴 실패:', error);
      setIsWithdrawalModalVisible(false);
      if (isRetryableError(error)) {
        setFailedRequest({
          retry: confirmWithdrawal,
          isOffline: error instanceof NetworkOfflineError,
        });
      } else {
        setInfoError(
          error instanceof ApiError ? error.message : '회원탈퇴에 실패했어요.',
        );
      }
    } finally {
      setIsWithdrawing(false);
    }
  };

  const retryFailedRequest = () => {
    const request = failedRequest;
    setFailedRequest(null);
    request?.retry();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator color={Colors.pink.pink50} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.profileSection}>
          <View style={styles.profileImagePlaceholder}>
            {member?.profile_img && !profileImageFailed ? (
              <Image
                source={{ uri: member.profile_img }}
                style={styles.profileImage}
                onError={() => setProfileImageFailed(true)}
              />
            ) : (
              <ProfileEmptyIcon />
            )}
          </View>

          <Text numberOfLines={2} ellipsizeMode="tail" style={styles.nickname}>
            {nickname}
          </Text>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>정책</Text>
          {POLICY_ITEMS.map((item, index) => (
            <Pressable
              key={item.label}
              style={[styles.menuItem, index > 0 && styles.menuItemGap]}
              onPress={() => Linking.openURL(item.url)}
            >
              <Text style={styles.menuText}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.menuSection, styles.accountSection]}>
          <Text style={styles.sectionTitle}>계정</Text>
          <Pressable style={styles.menuItem} onPress={() => void logout()}>
            <Text style={styles.menuText}>로그아웃</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={[styles.menuItem, styles.menuItemGap]}
            onPress={() => setIsWithdrawalModalVisible(true)}
          >
            <Text style={styles.withdrawalText}>회원탈퇴</Text>
          </Pressable>
        </View>
      </View>

      <AlertModal
        visible={isWithdrawalModalVisible}
        title="탈퇴하시겠습니까?"
        description="14일 이내에 로그인 시 계정이 복구됩니다."
        cancelText={isWithdrawing ? undefined : '취소'}
        confirmText={isWithdrawing ? '처리 중...' : '탈퇴'}
        onClose={() => setIsWithdrawalModalVisible(false)}
        onConfirm={confirmWithdrawal}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.gray.gray00,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.gray.gray00,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: 'center',
    // Android 상단 안전영역을 포함한 피그마 프로필 위치에 맞춘 값이다.
    paddingTop: 86,
    // 피그마처럼 닉네임과 정책 섹션 사이의 여백을 유지한다.
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  profileImagePlaceholder: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    backgroundColor: Colors.gray.gray10,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  nickname: {
    marginTop: 16,
    maxWidth: 260,
    color: Colors.gray.gray100,
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.lg,
    lineHeight: 30,
    textAlign: 'center',
  },
  menuSection: {
    borderTopWidth: 16,
    borderTopColor: Colors.gray.gray20,
    paddingTop: 32,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  accountSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray.gray20,
    paddingTop: 19,
  },
  sectionTitle: {
    marginBottom: 6,
    color: Colors.gray.gray70,
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    lineHeight: 21,
  },
  menuItem: {
    minHeight: 44,
    justifyContent: 'center',
  },
  menuItemGap: {
    marginTop: 8,
  },
  menuText: {
    color: Colors.gray.gray100,
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.md,
    lineHeight: 24,
  },
  withdrawalText: {
    color: Colors.pink.pink50,
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.md,
    lineHeight: 24,
  },
});
