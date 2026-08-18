import { FestivalNaviIcon, MyNaviIcon, StampNaviIcon, TourNaviIcon } from '@/components/icons';
import { Colors, FontFamily, FontSize } from '@/constants/theme';
import { router, type Href } from 'expo-router';
import type { ComponentType } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type NavTab = 'festival' | 'tour' | 'stamp' | 'my';

type Props = {
  activeTab: NavTab;
};

const ACTIVE_COLOR = Colors.pink.pink50;
const INACTIVE_COLOR = Colors.gray.gray70;

type TabConfig = {
  label: string;
  href: Href;
  Icon: ComponentType<{ color?: string }>;
};

// href는 #16에서 만든 스텁 페이지(내용 없음) — activeTab은 화면에서 직접 지정해야 함(현재 경로로 자동 판단 안 함)
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
