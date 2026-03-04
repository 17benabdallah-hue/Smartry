import { useState } from 'react';
import { SettingsScreen } from '../components/SettingsScreen';
import { LanguageScreen } from '../components/LanguageScreen';

export default function Home() {
  const [screen, setScreen] = useState<'settings' | 'language'>('settings');

  if (screen === 'language') {
    return <LanguageScreen onBack={() => setScreen('settings')} />;
  }

  return (
    <SettingsScreen
