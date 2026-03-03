'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en' | 'fr' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations = {
  ar: {
    app_name: 'السكرتير الذكي',
    add_reminder: 'إضافة تذكير',
    settings: 'الإعدادات',
    language: 'اللغة',
    dark_mode: 'الوضع الليلي',
    about: 'عن التطبيق',
    version: 'الإصدار',
    developed_by: 'تطوير: عبدالله بن عبدالله',
    in_collaboration_with: 'بالتعاون مع DeepSeek AI و Gemini',
  },
  en: {
    app_name: 'Smart Secretary',
    add_reminder: 'Add Reminder',
    settings: 'Settings',
    language: 'Language',
    dark_mode: 'Dark Mode',
    about: 'About',
    version: 'Version',
    developed_by: 'Developed by: Abdellah Benabdellah',
    in_collaboration_with: 'In collaboration with DeepSeek AI & Gemini',
  },
  fr: {
    app_name: 'Secrétaire Intelligent',
    add_reminder: 'Ajouter un rappel',
    settings: 'Paramètres',
    language: 'Langue',
    dark_mode: 'Mode sombre',
    about: 'À propos',
    version: 'Version',
    developed_by: 'Développé par: Abdellah Benabdellah',
    in_collaboration_with: 'En collaboration avec DeepSeek AI et Gemini',
  },
  zh: {
    app_name: '智能秘书',
    add_reminder: '添加提醒',
    settings: '设置',
    language: '语言',
    dark_mode: '夜间模式',
    about: '关于',
    version: '版本',
    developed_by: '开发者: Abdellah Benabdellah',
    in_collaboration_with: '与DeepSeek AI和Gemini合作',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('ar');

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved && ['ar', 'en', 'fr', 'zh'].includes(saved)) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
