
import { BottomNavigation } from '@/components/common/BottomNavigation';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <BottomNavigation {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '축제',
        }}
      />

      <Tabs.Screen
        name="tour"
        options={{
          title: '투어',
        }}
      />

      <Tabs.Screen
        name="stamp"
        options={{
          title: '도장',
        }}
      />

      <Tabs.Screen
        name="mypage"
        options={{
          title: 'MY',
        }}
      />
    </Tabs>
  );
}