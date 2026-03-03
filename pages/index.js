import { SettingsScreen } from '../components/SettingsScreen';

export default function Home() {
  return (
    <SettingsScreen
      onBack={() => {}}
      onNavigateToLanguage={() => alert('سيتم إضافة شاشة اختيار اللغة قريباً')}
    />
  );
}
