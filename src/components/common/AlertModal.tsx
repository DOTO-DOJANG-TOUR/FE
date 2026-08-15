import { FontFamily, FontSize } from '@/constants/theme';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  title: string;
  description: string;
  onClose: () => void;
  onConfirm: () => void;
};

export const AlertModal = ({
  visible,
  title,
  description,
  onClose,
  onConfirm,
}: Props) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          <View style={styles.buttonContainer}>
            <Pressable
              style={styles.button}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </Pressable>

            <Pressable
              style={styles.button}
              onPress={onConfirm}
            >
              <Text style={styles.stopButtonText}>중단</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(38, 38, 38, 0.30)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: 300,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderRadius: 10,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#262626',
    fontSize: FontSize.md,
    fontFamily: FontFamily.semiBold,
    lineHeight: FontSize.md * 1.5,
    textAlign: 'center',
  },
  description: {
    color: '#262626',
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    lineHeight: FontSize.sm * 1.5,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 7,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    marginHorizontal: 20,
  },
  cancelButtonText: {
    color: '#262626',
    fontSize: FontSize.sm,
    fontFamily: FontFamily.medium,
    lineHeight: FontSize.sm * 1.5,
  },
  stopButtonText: {
    color: '#FF4032',
    fontSize: FontSize.sm,
    fontFamily: FontFamily.medium,
    lineHeight: FontSize.sm * 1.5,
  },
});