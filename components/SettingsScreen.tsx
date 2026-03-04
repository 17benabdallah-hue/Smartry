'use client';

import React from 'react';
import { ChevronLeft, Globe, Moon } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

interface SettingsScreenProps {
  onBack: () => void;
  onNavigateToLanguage: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  onNavigateToLanguage,
}) => {
  const { t, isRTL } = useLanguage();

  return (
    <div className="flex flex-col h-full min-h-screen bg-orange-600 dark:bg-zinc-950 text-black dark:text-white transition-colors duration-500">
      {/* الشريط العلوي */}
      <div className="flex items-center gap-4 p-6 bg-black/10 backdrop-blur-sm sticky top-0 z-10 border-b border-white/10">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
        >
          {isRTL ? <ChevronLeft className="w-6 h-6 rotate-180" /> : <ChevronLeft className="w-6 h-6" />}
        </button>
        <h1 className="text-2xl font-black tracking-tight text-white">{t('settings')}</h1>
      </div>

      {/* المحتوى */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* قسم اللغة */}
        <div className="space-y-2">
          <h2 className="text-xs font-black text-white/50 uppercase tracking-widest px-2">
            {t('language')}
          </h2>
          <button
            onClick={onNavigateToLanguage}
            className="w-full bg-white dark:bg-zinc-900 p-5 rounded-3xl flex items-center justify-between shadow-lg border border-black/5 dark:border-white/5"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-600/10 text-orange-600 rounded-2xl flex items-center justify-center">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-black dark:text-white">{t('language')}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  {t('arabic') || 'العربية'} / English / Français / 中文
                </p>
              </div>
            </div>
            <ChevronLeft className={`w-5 h-5 text-zinc-400 ${isRTL ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* قسم الوضع الليلي */}
        <div className="space-y-2">
          <h2 className="text-xs font-black text-white/50 uppercase tracking-widest px-2">
            {t('dark_mode')}
          </h2>
          <div className="w-full bg-white dark:bg-zinc-900 p-5 rounded-3xl flex items-center justify-between shadow-lg border border-black/5 dark:border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-600/10 text-orange-600 rounded-2xl flex items-center justify-center">
                <Moon className="w-6 h-6" />
              </div>
              <p className="font-bold text-black dark:text-white">{t('dark_mode')}</p>
            </div>
            <button
              <button
  className="px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-black"
  onClick={() => {
    // سنضيف هنا منطق تغيير الوضع لاحقاً
    alert('الوضع الليلي: قيد التطوير');
  }}
>
  {t('activate') || 'تفعيل'}
</button>
            >
              {t('activate') || 'تفعيل'}
            </button>
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="space-y-2">
          <h2 className="text-xs font-black text-white/50 uppercase tracking-widest px-2">
            {t('about')}
          </h2>
          <div className="w-full bg-white dark:bg-zinc-900 p-5 rounded-3xl shadow-lg border border-black/5 dark:border-white/5">
            <p className="text-black dark:text-white font-bold">Smartry v2.0</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              {t('developed_by')} - {t('in_collaboration_with')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
