import { CategoryBadge } from '@/components/common/CategoryBadge';
import { Colors, FontFamily, FontSize, Radius } from '@/constants/theme';
import type { TourCategory } from '@/types/tour';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export type MarkerGroupOption = {
  id: string;
  title: string;
  category: TourCategory;
};

type Props = {
  visible: boolean;
  options: MarkerGroupOption[];
  onSelect: (id: string) => void;
  onClose: () => void;
};

// 좌표가 같아 마커 하나로 합쳐진 관광지가 2개 이상이면, 그중 어디로 이동할지 고르게 한다(#37).
export function MarkerGroupPicker({ visible, options, onSelect, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.content}>
          <Text style={styles.title}>같은 위치에 관광지가 여러 개 있어요</Text>
          <View style={styles.list}>
            {options.map((option) => (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                accessibilityLabel={`${option.title} 상세 보기`}
                style={styles.row}
                onPress={() => onSelect(option.id)}
              >
                <CategoryBadge category={option.category} />
                <Text style={styles.rowText} numberOfLines={1}>
                  {option.title}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(38, 38, 38, 0.30)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: 280,
    paddingVertical: 20,
    borderRadius: Radius.md,
    backgroundColor: Colors.gray.gray00,
  },
  title: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    color: Colors.gray.gray100,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.semiBold,
    lineHeight: FontSize.sm * 1.5,
    textAlign: 'center',
  },
  list: {
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  rowText: {
    flex: 1,
    color: Colors.gray.gray100,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.medium,
    lineHeight: FontSize.sm * 1.5,
  },
});
