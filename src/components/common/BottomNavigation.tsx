import { FestivalNaviIcon, MyNaviIcon, StampNaviIcon, TourNaviIcon } from '@/components/icons';
import { FontFamily, FontSize } from '@/constants/theme';
import { router, type Href } from 'expo-router';
import type { ComponentType } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type NavTab = 'festival' | 'tour' | 'stamp' | 'my';

type Props = {
  activeTab: NavTab;
};

const ACTIVE_COLOR = '#FA5144';
const INACTIVE_COLOR = '#A8A8A8';

type TabConfig = {
  label: string;
  href: Href;
  Icon: ComponentType<{ color?: string }>;
};

const tabConfig: Record<NavTab, TabConfig> = {
  festival: { label: '축제', href: '/', Icon: FestivalNaviIcon },
  tour: { label: '투어', href: '/tour', Icon: TourNaviIcon },
  stamp: { label: '도장', href: '/stamp', Icon: StampNaviIcon },
  my: { label: 'MY', href: '/mypage', Icon: MyNaviIcon },
};

const tabs: NavTab[] = ['festival', 'tour', 'stamp', 'my'];

export const BottomNavigation = ({ activeTab }: Props) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const { label, href, Icon } = tabConfig[tab];
        const isActive = tab === activeTab;
        const color = isActive ? ACTIVE_COLOR : INACTIVE_COLOR;

        return (
          <Pressable key={tab} style={styles.tab} onPress={() => router.push(href)}>
            <Icon color={color} />
            <Text style={[styles.label, { color }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 91,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 45.5,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
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
