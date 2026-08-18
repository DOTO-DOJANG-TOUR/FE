import { FontFamily, FontSize, Spacing } from '@/constants/theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CultureIcon, ExperienceIcon, HistoryIcon, MenuIcon, NatureIcon } from '../icons';

type Category = 'menu' | 'culture' | 'history' | 'nature' | 'experience';

type Props = {
  category: Category;
  selected?: boolean;
  onPress?: () => void;
};

const categoryConfig = {
  menu: {
    label: '전체',
    Icon: MenuIcon,
  },
  culture: {
    label: '문화',
    Icon: CultureIcon,
  },
  history: {
    label: '역사',
    Icon: HistoryIcon,
  },
  nature: {
    label: '자연',
    Icon: NatureIcon,
  },
  experience: {
    label: '체험',
    Icon: ExperienceIcon,
  },
};

export const CategoryBadge = ({
  category,
  selected = false,
  onPress,
}: Props) => {
  const config = categoryConfig[category];
  const Icon = config.Icon;

  const isSelected = !!onPress && selected;

  return (
    <Pressable style={[
      styles.badge,
      isSelected && styles.selectedBadge,
    ]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <Icon color={isSelected ? '#FFFFFF' : '#A8A8A8'} />
      </View>
      <Text
        style={[
          styles.text,
          isSelected && styles.selectedText,
        ]}
      >
        {config.label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: Spacing.two,
    gap: 2,
    borderRadius: 6,
    backgroundColor: '#FAFAFA',
  },
  selectedBadge: {
    backgroundColor: '#323232',
  },
  iconContainer: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#A8A8A8',
    fontSize: FontSize.sm,
    fontFamily: FontFamily.semiBold,
  },
  selectedText: {
    color: '#FFF'
  },
});