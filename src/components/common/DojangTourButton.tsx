import { FontFamily, FontSize } from '@/constants/theme';
import { Pressable, StyleSheet, Text } from 'react-native';

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
    backgroundColor: '#FF675F',
  },
  disabledButton: {
    backgroundColor: '#F6F6F6',
  },
  text: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.5,
    fontFamily: FontFamily.semiBold,
    textAlign: 'center',
  },
  activeText: {
    color: '#FFFFFF',
  },
  disabledText: {
    color: '#BCBCBC',
  },
});
