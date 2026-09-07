import { Radius } from '@/constants/theme';
import { TourColors } from '@/constants/tourTheme';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type Props = {
  columns?: number;
  rows?: number;
  rounded?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function CheckerPlaceholder({
  columns = 8,
  rows = 12,
  rounded = false,
  style,
}: Props) {
  const cells = Array.from({ length: columns * rows });

  return (
    <View style={[styles.container, rounded && styles.rounded, style]}>
      {cells.map((_, index) => {
        const row = Math.floor(index / columns);
        const isDark = (row + index) % 2 === 0;

        return (
          <View
            key={index}
            style={{
              width: `${100 / columns}%`,
              height: `${100 / rows}%`,
              backgroundColor: isDark ? TourColors.gray30 : TourColors.gray10,
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
    backgroundColor: TourColors.gray10,
  },
  rounded: {
    borderRadius: Radius.md,
  },
});
