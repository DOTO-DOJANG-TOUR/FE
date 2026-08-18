import { FestivalNaviIcon, MyNaviIcon, StampNaviIcon, TourNaviIcon } from '@/components/icons';
import { Colors, FontFamily, FontSize } from '@/constants/theme';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ACTIVE_COLOR = Colors.pink.pink50;
const INACTIVE_COLOR = Colors.gray.gray70;

const tabConfig = {
  index: {
    label: '축제',
    Icon: FestivalNaviIcon,
  },

  tour: {
    label: '투어',
    Icon: TourNaviIcon,
  },

  stamp: {
    label: '도장',
    Icon: StampNaviIcon,
  },

  mypage: {
    label: 'MY',
    Icon: MyNaviIcon,
  },
};

export const BottomNavigation = ({
  state,
  navigation,
}: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  return (
     <View style={[
        styles.container,
        {
          paddingBottom: insets.bottom,
        },
      ]}>
      {state.routes.map((route, index) => {
        const config =
          tabConfig[route.name as keyof typeof tabConfig];

        if (!config) {
          return null;
        }

        const { label, Icon } = config;

        const isActive = state.index === index;

        const color = isActive
          ? ACTIVE_COLOR
          : INACTIVE_COLOR;

        const handlePress = () => {
          if (!isActive) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            style={styles.tab}
            onPress={handlePress}
          >
            <Icon color={color} />

            <Text
              style={[
                styles.label,
                { color },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 91,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 45.5,
    paddingTop: 8,
    backgroundColor: Colors.gray.gray00,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
  },
  tab: {
    alignItems: 'center',
  },
  label: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.5,
    fontFamily: FontFamily.medium,
    textAlign: 'center',
  },
});
