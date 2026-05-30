import { Redirect } from 'expo-router';
import { useSettingsStore } from '@/stores/useSettingsStore';

export default function Index() {
  const onboardingDone = useSettingsStore((s) => s.onboardingDone);
  return <Redirect href={onboardingDone ? '/home' : '/onboarding'} />;
}
