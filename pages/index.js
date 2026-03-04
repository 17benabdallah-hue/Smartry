import { useState } from 'react';
import { SettingsScreen } from '../components/SettingsScreen';
import { LanguageScreen } from '../components/LanguageScreen';
import { ReminderApp } from '../components/ReminderApp';

export default function Home() {
  const [screen, setScreen] = useState('reminder'); // 'reminder', 'settings', 'language'

  if (screen === 'settings') {
    return (
      <SettingsScreen
        onBack={() => setScreen('reminder')}
        onNavigateToLanguage={() => setScreen('language')}
      />
    );
  }

  if (screen === 'language') {
    return <LanguageScreen onBack={() => setScreen('settings')} />;
  }

  return (
    <ReminderApp onOpenSettings={() => setScreen('settings')} />
  );
}
