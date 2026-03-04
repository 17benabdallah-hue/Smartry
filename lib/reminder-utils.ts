// lib/reminder-utils.ts

export type EventType = 'food' | 'medicine' | 'flight' | 'meeting' | 'school' | 'other';
export type ReminderStage = 'warning' | 'final';

// مصفوفات الكلمات المفتاحية (أضفها هنا)
const foodKeywords = ['حليب', 'طعام', 'فرن', 'نار', 'milk', 'food', 'oven', 'stove'];
const medicineKeywords = ['دواء', 'علاج', 'medicine', 'pill', 'medication'];
const travelKeywords = ['رحلة', 'سفر', 'trip', 'travel', 'flight'];
const meetingKeywords = ['اجتماع', 'موعد', 'meeting', 'appointment'];
const schoolKeywords = ['مدرسة', 'ابن', 'school', 'child'];

export interface Reminder {
  id: string;
  text: string;
  eventType: EventType;
  eventTime: Date;
  reminderTimes: string[];
  location?: string;
  confidence: number;
  suggestedMessage: string;
  createdAt: Date;
  isCompleted: boolean;
  stage: ReminderStage;
  totalDurationMinutes?: number;
}

export function formatReminderTime(date: Date): string {
  return new Intl.DateTimeFormat('ar-DZ', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

export function getTimeRemaining(reminderTime: Date): string {
  const now = new Date();
  const diff = reminderTime.getTime() - now.getTime();
  
  if (diff <= 0) return 'مستحق الآن';
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `بعد ${days} يوم`;
  if (hours > 0) return `بعد ${hours} ساعة`;
  return `بعد ${minutes} دقيقة`;
}
