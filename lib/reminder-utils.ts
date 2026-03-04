// lib/reminder-utils.ts

export type EventType = 'food' | 'medicine' | 'flight' | 'meeting' | 'school' | 'other';

// تعريف ReminderStage ككائن ثابت (بدلاً من enum)
export const ReminderStage = {
  WARNING: 'warning',
  FINAL: 'final'
} as const;

export type ReminderStageType = typeof ReminderStage[keyof typeof ReminderStage];

export type Priority = 1 | 2 | 3 | 4;

export interface Reminder {
  id: string;
  text: string;
  eventType: EventType;
  eventTime: string;
  reminderTime: string;
  reminderTimes: string[];
  location?: string;
  confidence: number;
  suggestedMessage: string;
  createdAt: string;
  isCompleted: boolean;
  recurring?: 'none' | 'hourly' | 'daily' | 'weekly';
  priority: Priority;
  snoozeCount: number;
  maxSnooze: number;
  stage: ReminderStageType;
  totalDurationMinutes?: number;
  parentId?: string;
}

export const getPriorityLabel = (priority: Priority, language: string): string => {
  const labels: Record<string, Record<Priority, string>> = {
    ar: { 1: 'منخفضة', 2: 'متوسطة', 3: 'عالية', 4: 'عاجلة' },
    en: { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Urgent' },
    fr: { 1: 'Basse', 2: 'Moyenne', 3: 'Haute', 4: 'Urgente' },
    zh: { 1: '低', 2: '中', 3: '高', 4: '紧急' },
  };
  return labels[language]?.[priority] || String(priority);
};

export const getPriorityColor = (priority: Priority): string => {
  switch (priority) {
    case 4: return 'bg-red-500 text-white';
    case 3: return 'bg-orange-500 text-white';
    case 2: return 'bg-yellow-500 text-white';
    default: return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

// دالة مؤقتة لتحليل النص (يمكن تطويرها لاحقاً)
export const parseSmartTime = (text: string, language: string) => {
  // هذه مجرد دالة وهمية لتجنب الأخطاء
  return {
    reminderTimes: [new Date()],
    eventTime: new Date(),
    priority: 2 as Priority,
    location: undefined,
    confidence: 0.5,
    suggestedMessage: 'تم التحليل',
    totalDurationMinutes: 15
  };
};
