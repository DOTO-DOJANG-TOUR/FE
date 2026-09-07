import { Colors, FontFamily, FontSize } from '@/constants/theme';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function TourVisitConfirmModal({ visible, onClose, onConfirm }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>이 관광지를 방문할까요?</Text>
          <Text style={styles.description}>{'7시간 이내에 도착하면\n도장을 획득합니다.'}</Text>
          <View style={styles.buttonContainer}>
            <Pressable style={styles.button} onPress={onClose}>
              <Text style={styles.cancelText}>취소</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={onConfirm}>
              <Text style={styles.confirmText}>방문</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(38, 38, 38, 0.30)',
  },
  content: {
    width: 300,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderRadius: 10,
    backgroundColor: Colors.gray.gray00,
  },
  title: {
    color: Colors.gray.gray100,
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.5,
    fontFamily: FontFamily.semiBold,
    textAlign: 'center',
  },
  description: {
    color: Colors.gray.gray100,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 7,
  },
  button: {
    marginHorizontal: 20,
    paddingHorizontal: 20,
    paddingVertical: 9,
  },
  cancelText: {
    color: Colors.gray.gray100,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    fontFamily: FontFamily.medium,
  },
  confirmText: {
    color: Colors.pink.pink50,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    fontFamily: FontFamily.medium,
  },
});
