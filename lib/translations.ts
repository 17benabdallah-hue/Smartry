// lib/translations.ts
export type LanguageCode = 'ar' | 'en' | 'fr' | 'zh';

export type Translations = {
  app_name: string;
  settings: string;
  language: string;
  dark_mode: string;
  notifications: string;
  privacy_security: string;
  smart_analysis: string;
  smart_analysis_desc: string;
  about: string;
  version: string;
  developed_by: string;
  in_collaboration_with: string;
  search_placeholder: string;
  active_reminders: string;
  no_active_reminders: string;
  priority: string;
  warning: string;
  location: string;
  hourly: string;
  daily: string;
  weekly: string;
  all_alerts: string;
  snooze: string;
  delete: string;
  details: string;
  cancel: string;
  back: string;
  new_reminder: string;
  what_to_remember: string;
  smart_suggestions: string;
  smart_completion: string;
  smart_analysis: string;
  confidence: string;
  event_time: string;
  remind_before: string;
  suggested_message: string;
  recurring: string;
  once: string;
  save_reminder: string;
  completed_recently: string;
  clear_all: string;
  system_preferences: string;
};

export const translations: Record<LanguageCode, Translations> = {
  ar: {
    app_name: 'السكرتير الذكي',
    settings: 'الإعدادات',
    language: 'اللغة',
    dark_mode: 'الوضع الليلي',
    notifications: 'الإشعارات',
    privacy_security: 'الخصوصية والأمان',
    smart_analysis: 'تحليل ذكي',
    smart_analysis_desc: 'تحليل النصوص لتحديد الوقت تلقائياً',
    about: 'عن التطبيق',
    version: 'الإصدار',
    developed_by: 'تطوير: عبدالله بن عبدالله',
    in_collaboration_with: 'بالتعاون مع DeepSeek AI و Gemini',
    search_placeholder: 'البحث في التذكيرات...',
    active_reminders: 'التذكيرات النشطة',
    no_active_reminders: 'لا توجد تذكيرات نشطة',
    priority: 'أولوية',
    warning: 'تحذيري',
    location: 'الموقع',
    hourly: 'كل ساعة',
    daily: 'يومي',
    weekly: 'أسبوعي',
    all_alerts: 'جميع التنبيهات',
    snooze: 'غفوة',
    delete: 'حذف',
    details: 'تفاصيل',
    cancel: 'إلغاء',
    back: 'رجوع',
    new_reminder: 'تذكير جديد',
    what_to_remember: 'ماذا تريد أن تتذكر؟',
    smart_suggestions: 'اقتراحات ذكية',
    smart_completion: 'إكمال ذكي',
    smart_analysis: 'تحليل ذكي',
    confidence: 'الثقة',
    event_time: 'وقت الحدث',
    remind_before: 'تذكير قبل',
    suggested_message: 'الرسالة المقترحة',
    recurring: 'تكرار',
    once: 'مرة واحدة',
    save_reminder: 'حفظ التذكير',
    completed_recently: 'المنتهية مؤخراً',
    clear_all: 'مسح الكل',
    system_preferences: 'تفضيلات النظام',
  },
  en: {
    app_name: 'Smart Secretary',
    settings: 'Settings',
    language: 'Language',
    dark_mode: 'Dark Mode',
    notifications: 'Notifications',
    privacy_security: 'Privacy & Security',
    smart_analysis: 'Smart Analysis',
    smart_analysis_desc: 'Analyze text to set time automatically',
    about: 'About',
    version: 'Version',
    developed_by: 'Developed by: Abdellah Benabdellah',
    in_collaboration_with: 'In collaboration with DeepSeek AI & Gemini',
    search_placeholder: 'Search reminders...',
    active_reminders: 'Active Reminders',
    no_active_reminders: 'No active reminders',
    priority: 'Priority',
    warning: 'Warning',
    location: 'Location',
    hourly: 'Hourly',
    daily: 'Daily',
    weekly: 'Weekly',
    all_alerts: 'All Alerts',
    snooze: 'Snooze',
    delete: 'Delete',
    details: 'Details',
    cancel: 'Cancel',
    back: 'Back',
    new_reminder: 'New Reminder',
    what_to_remember: 'What do you want to remember?',
    smart_suggestions: 'Smart Suggestions',
    smart_completion: 'Smart Completion',
    smart_analysis: 'Smart Analysis',
    confidence: 'Confidence',
    event_time: 'Event Time',
    remind_before: 'Remind Before',
    suggested_message: 'Suggested Message',
    recurring: 'Recurring',
    once: 'Once',
    save_reminder: 'Save Reminder',
    completed_recently: 'Recently Completed',
    clear_all: 'Clear All',
    system_preferences: 'System Preferences',
  },
  fr: {
    app_name: 'Secrétaire Intelligent',
    settings: 'Paramètres',
    language: 'Langue',
    dark_mode: 'Mode sombre',
    notifications: 'Notifications',
    privacy_security: 'Confidentialité et sécurité',
    smart_analysis: 'Analyse intelligente',
    smart_analysis_desc: 'Analyser le texte pour définir l\'heure automatiquement',
    about: 'À propos',
    version: 'Version',
    developed_by: 'Développé par: Abdellah Benabdellah',
    in_collaboration_with: 'En collaboration avec DeepSeek AI & Gemini',
    search_placeholder: 'Rechercher des rappels...',
    active_reminders: 'Rappels actifs',
    no_active_reminders: 'Aucun rappel actif',
    priority: 'Priorité',
    warning: 'Avertissement',
    location: 'Emplacement',
    hourly: 'Toutes les heures',
    daily: 'Quotidien',
    weekly: 'Hebdomadaire',
    all_alerts: 'Toutes les alertes',
    snooze: 'Rappeler',
    delete: 'Supprimer',
    details: 'Détails',
    cancel: 'Annuler',
    back: 'Retour',
    new_reminder: 'Nouveau rappel',
    what_to_remember: 'Que voulez-vous retenir?',
    smart_suggestions: 'Suggestions intelligentes',
    smart_completion: 'Complétion intelligente',
    smart_analysis: 'Analyse intelligente',
    confidence: 'Confiance',
    event_time: 'Heure de l\'événement',
    remind_before: 'Rappeler avant',
    suggested_message: 'Message suggéré',
    recurring: 'Récurrent',
    once: 'Une fois',
    save_reminder: 'Enregistrer le rappel',
    completed_recently: 'Récemment terminés',
    clear_all: 'Tout effacer',
    system_preferences: 'Préférences système',
  },
  zh: {
    app_name: '智能秘书',
    settings: '设置',
    language: '语言',
    dark_mode: '夜间模式',
    notifications: '通知',
    privacy_security: '隐私与安全',
    smart_analysis: '智能分析',
    smart_analysis_desc: '分析文本以自动设置时间',
    about: '关于',
    version: '版本',
    developed_by: '开发者: Abdellah Benabdellah',
    in_collaboration_with: '与DeepSeek AI和Gemini合作',
    search_placeholder: '搜索提醒...',
    active_reminders: '活动提醒',
    no_active_reminders: '没有活动提醒',
    priority: '优先级',
    warning: '警告',
    location: '位置',
    hourly: '每小时',
    daily: '每日',
    weekly: '每周',
    all_alerts: '所有提醒',
    snooze: '稍后提醒',
    delete: '删除',
    details: '详情',
    cancel: '取消',
    back: '返回',
    new_reminder: '新提醒',
    what_to_remember: '您想记住什么？',
    smart_suggestions: '智能建议',
    smart_completion: '智能补全',
    smart_analysis: '智能分析',
    confidence: '置信度',
    event_time: '事件时间',
    remind_before: '提前提醒',
    suggested_message: '建议消息',
    recurring: '重复',
    once: '一次',
    save_reminder: '保存提醒',
    completed_recently: '最近完成',
    clear_all: '清除全部',
    system_preferences: '系统偏好',
  },
};
