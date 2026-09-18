import { Colors, FontFamily, FontSize } from '@/constants/theme';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

// Figma의 흰 배경+그림자 바깥 래퍼(bottomsheet, padding top14/bottom40/좌우20)는
// 페이지 레이아웃 몫이라 여기 포함 안 함 — 실제 화면에서 이 버튼을 감쌀 때 추가할 것

type DojangTourButtonStatus =
  | 'start'
  | 'stop'
  | 'stillProgress'
  | 'getReward'
  | 'alreadyRewarded'
  | 'visitAndStamp'
  | 'arrived'
  | 'alreadyVisited'
  | 'alreadyJoinedTour'
  | 'inOtherTour'
  | 'alreadyEnded'
  | 'agree'
  | 'confirm';

type Props = {
  status: DojangTourButtonStatus;
  // 요청이 진행 중임을 보여준다(예: GPS 좌표 확인 중) — 버튼이 계속 활성 색으로 보이면
  // 반응이 없다고 느껴 연타하게 되므로, 라벨 대신 스피너를 보여주고 탭을 막는다.
  loading?: boolean;
  onPress?: () => void;
};

const statusConfig: Record<DojangTourButtonStatus, { label: string; active: boolean }> = {
  start: { label: '도장 투어 시작하기', active: true },
  stop: { label: '도장 투어 중단하기', active: true },
  visitAndStamp: { label: '방문하고 도장 받기', active: true },
  arrived: { label: '관광지에 도착했어요', active: true },
  alreadyVisited: { label: '이미 방문한 관광지예요', active: false },
  alreadyJoinedTour: { label: '이미 참여한 투어예요', active: false },
  inOtherTour: { label: '다른 투어에 참여 중이에요', active: false },
  alreadyEnded: { label: '이미 종료된 투어예요', active: false },
  stillProgress: { label: '도장 3개를 획득해 주세요', active: false },
  getReward: { label: '보상 수령하기', active: true },
  alreadyRewarded: { label: '이미 보상을 수령했어요', active: false },
  agree: { label: '동의', active: true },
  confirm: { label: '확인', active: true },
};

export const DojangTourButton = ({ status, loading = false, onPress }: Props) => {
  const { label, active } = statusConfig[status];
  const disabled = !active || loading;

  return (
    <Pressable
      style={[styles.button, active ? styles.activeButton : styles.disabledButton]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
    >
      {loading ? (
        <ActivityIndicator color={active ? Colors.gray.gray00 : Colors.gray.gray60} />
      ) : (
        <Text style={[styles.text, active ? styles.activeText : styles.disabledText]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: Colors.pink.pink40,
  },
  disabledButton: {
    backgroundColor: Colors.gray.gray20,
  },
  text: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.5,
    fontFamily: FontFamily.semiBold,
    textAlign: 'center',
  },
  activeText: {
    color: Colors.gray.gray00,
  },
  disabledText: {
    color: Colors.gray.gray60,
  },
});
