import { AlertModal } from '@/components/common/AlertModal';
import { MyNaviIcon } from '@/components/icons';
import { Colors, FontFamily, FontSize } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const POLICY_ITEMS = ['이용 약관', '개인정보 취급방침'];

export default function MyPageScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isWithdrawalModalVisible, setIsWithdrawalModalVisible] = useState(false);

  const nickname = user?.nickname || '김만두';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.profileSection}>
          <View style={styles.profileImagePlaceholder}>
            <MyNaviIcon color={Colors.gray.gray60} />
          </View>
          <Text numberOfLines={2} ellipsizeMode="tail" style={styles.nickname}>
            {nickname}
          </Text>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>정책</Text>
          {POLICY_ITEMS.map((item) => (
            <Pressable key={item} style={styles.menuItem}>
              <Text style={styles.menuText}>{item}</Text>
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
            style={styles.menuItem}
            onPress={() => setIsWithdrawalModalVisible(true)}
          >
            <Text style={styles.withdrawalText}>회원탈퇴</Text>
          </Pressable>
        </View>
      </View>

      <AlertModal
        visible={isWithdrawalModalVisible}
        title="탈퇴하시겠습니까?"
        description="탈퇴 이후에는 로그인 시 계정이 복구됩니다."
        cancelText="취소"
        confirmText="탈퇴"
        onClose={() => setIsWithdrawalModalVisible(false)}
        // 실제 회원탈퇴 API 연동은 #45에서 처리한다.
        onConfirm={() => setIsWithdrawalModalVisible(false)}
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
  profileSection: {
    alignItems: 'center',
    // Android 상단 안전영역을 포함한 피그마 프로필 위치에 맞춘 값이다.
    paddingTop: 86,
    // 피그마처럼 닉네임과 정책 섹션 사이의 여백을 유지한다.
    paddingBottom: 56,
  },
  profileImagePlaceholder: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: Colors.gray.gray20,
  },
  nickname: {
    maxWidth: 260,
    marginTop: 26,
    color: Colors.gray.gray100,
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.md,
    lineHeight: 24,
    textAlign: 'center',
  },
  menuSection: {
    borderTopWidth: 10,
    borderTopColor: Colors.gray.gray20,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  accountSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray.gray20,
  },
  sectionTitle: {
    marginBottom: 7,
    color: Colors.gray.gray70,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  menuItem: {
    minHeight: 40,
    justifyContent: 'center',
  },
  menuText: {
    color: Colors.gray.gray100,
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    lineHeight: 21,
  },
  withdrawalText: {
    color: Colors.pink.pink50,
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    lineHeight: 21,
  },
});
