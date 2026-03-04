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
}// أضف هذه الدالة في نهاية الملف (بعد getTimeRemaining وقبل أي export آخر إن وجد)

export function parseReminderText(text: string): { type: EventType; confidence: number; durationMinutes?: number } {
  const lowerText = text.toLowerCase();
  
  // فحص الكلمات المفتاحية لكل نوع
  if (foodKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
    return { type: 'food', confidence: 0.8, durationMinutes: 25 };
  }
  if (medicineKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
    return { type: 'medicine', confidence: 0.8, durationMinutes: 30 };
  }
  if (travelKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
    return { type: 'flight', confidence: 0.7, durationMinutes: 120 };
  }
  if (meetingKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
    return { type: 'meeting', confidence: 0.7, durationMinutes: 60 };
  }
  if (schoolKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
    return { type: 'school', confidence: 0.7, durationMinutes: 240 };
  }
  
  return { type: 'other', confidence: 0.3, durationMinutes: 15 };
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
