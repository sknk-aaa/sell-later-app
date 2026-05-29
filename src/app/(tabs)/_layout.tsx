import { Tabs } from 'expo-router';
import { TabBar } from '@/components/TabBar';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="list" />
      <Tabs.Screen name="analytics" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
