'use client';

import React from 'react';
import { ChevronLeft, Check } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

interface LanguageScreenProps {
  onBack: () => void;
}

export const LanguageScreen: React.FC<LanguageScreenProps> = ({ onBack }) => {
  const { language, setLanguage, isRTL } = useLanguage();

  const languages = [
    { code: 'ar', label: 'العربية' },
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'zh', label: '中文' },
  ];

  const handleSelect = (code: string) => {
    setLanguage(code as 'ar' | 'en' | 'fr' | 'zh');
    onBack();
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-orange-600 dark:bg-zinc-950 text-black dark:text-white transition-colors duration-500">
      <div className="flex items-center gap-4 p-6 bg-black/10 backdrop-blur-sm sticky top-0 z-10 border-b border-white/10">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
          {isRTL ? <ChevronLeft className="w-6 h-6 rotate-180" /> : <ChevronLeft className="w-6 h-6" />}
        </button>
        <h1 className="text-2xl font-black tracking-tight text-white">اختر اللغة</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            className="w-full bg-white dark:bg-zinc-900 p-5 rounded-3xl flex items-center justify-between shadow-lg border border-black/5 dark:border-white/5"
          >
            <span className="text-lg font-bold text-black dark:text-white">{lang.label}</span>
            {language === lang.code && <Check className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
          </button>
        ))}
      </div>
    </div>
  );
};
