import { FontFamily, FontSize } from '@/constants/theme';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  title: string;
  description: string;
  cancelText?: string;
  confirmText: string;
  confirmTextColor?: string;
  onClose: () => void;
  onConfirm: () => void;
  singleLineDescription?: boolean;
};

export const AlertModal = ({
  visible,
  title,
  description,
  cancelText,
  confirmText,
  confirmTextColor = '#FF4032',
  onClose,
  onConfirm,
  singleLineDescription = false,
}: Props) => {
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
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description} numberOfLines={singleLineDescription ? 1 : undefined}
            adjustsFontSizeToFit={singleLineDescription} minimumFontScale={0.8}>{description}</Text>
          <View style={styles.buttonContainer}>
            {cancelText &&
              <Pressable
                style={styles.button}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </Pressable>
            }

            <Pressable
              style={styles.button}
              onPress={onConfirm}
            >
              <Text style={[
                styles.confirmButtonText,
                { color: confirmTextColor },
              ]}>{confirmText}</Text>
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
    maxWidth: '92%',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 11,
    borderRadius: 10,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#262626',
    fontSize: FontSize.md,
    fontFamily: FontFamily.semiBold,
    includeFontPadding: false,
    lineHeight: FontSize.md * 1.5,
    textAlign: 'center',
  },
  description: {
    marginTop: 2,
    color: '#262626',
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    includeFontPadding: false,
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
    includeFontPadding: false,
    lineHeight: FontSize.sm * 1.5,
  },
  confirmButtonText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.medium,
    includeFontPadding: false,
    lineHeight: FontSize.sm * 1.5,
  },
});
