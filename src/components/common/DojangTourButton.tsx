import { Colors, FontFamily, FontSize } from '@/constants/theme';
import { Pressable, StyleSheet, Text } from 'react-native';

// Figma의 흰 배경+그림자 바깥 래퍼(bottomsheet, padding top14/bottom40/좌우20)는
// 페이지 레이아웃 몫이라 여기 포함 안 함 — 실제 화면에서 이 버튼을 감쌀 때 추가할 것

type DojangTourButtonStatus =
  | 'start'
  | 'stop'
  | 'visitAndStamp'
  | 'alreadyVisited'
  | 'alreadyJoinedTour'
  | 'inOtherTour';

type Props = {
  status: DojangTourButtonStatus;
  onPress?: () => void;
};

const statusConfig: Record<DojangTourButtonStatus, { label: string; active: boolean }> = {
  start: { label: '도장 투어 시작하기', active: true },
  stop: { label: '도장 투어 중단하기', active: true },
  visitAndStamp: { label: '방문하고 도장 받기', active: true },
  alreadyVisited: { label: '이미 방문한 관광지예요', active: false },
  alreadyJoinedTour: { label: '이미 참여한 투어예요', active: false },
  inOtherTour: { label: '다른 투어에 참여 중이에요', active: false },
};

export const DojangTourButton = ({ status, onPress }: Props) => {
  const { label, active } = statusConfig[status];

  return (
    <Pressable
      style={[styles.button, active ? styles.activeButton : styles.disabledButton]}
      onPress={active ? onPress : undefined}
      disabled={!active}
    >
      <Text style={[styles.text, active ? styles.activeText : styles.disabledText]}>
        {label}
      </Text>
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
