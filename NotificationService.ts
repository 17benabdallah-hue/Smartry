'use client';

import { Reminder, EventType } from '@/lib/reminder-utils';
import { translations, LanguageCode } from '@/lib/translations';

class NotificationService {
  private timers: Map<string, NodeJS.Timeout[]> = new Map();

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }

  async requestPermission() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  }

  scheduleReminder(reminder: Reminder, onComplete: (id: string) => void) {
    if (reminder.isCompleted) return;

    // Cancel existing timers if any
    this.cancelReminder(reminder.id);

    const now = Date.now();
    const reminderTimers: NodeJS.Timeout[] = [];

    // Schedule all alert times
    reminder.reminderTimes.forEach((timeStr) => {
      const triggerTime = new Date(timeStr).getTime();
      const delay = triggerTime - now;

      if (delay > 0) {
        const timer = setTimeout(() => {
          this.showNotification(reminder);
          onComplete(reminder.id);
          
          // Remove this specific timer from the list
          const currentTimers = this.timers.get(reminder.id) || [];
          const updatedTimers = currentTimers.filter(t => t !== timer);
          if (updatedTimers.length === 0) {
            this.timers.delete(reminder.id);
          } else {
            this.timers.set(reminder.id, updatedTimers);
          }
        }, delay);
        reminderTimers.push(timer);
      }
    });

    if (reminderTimers.length > 0) {
      this.timers.set(reminder.id, reminderTimers);
    }
  }

  cancelReminder(id: string) {
    const reminderTimers = this.timers.get(id);
    if (reminderTimers) {
      reminderTimers.forEach((timer) => clearTimeout(timer));
      this.timers.delete(id);
    }
  }

  private showNotification(reminder: Reminder) {
    const lang = (typeof document !== 'undefined' ? document.documentElement.lang : 'ar') as LanguageCode;
    const t = translations[lang] || translations.ar;
    const title = '📋 ' + t.app_name;
    const body = reminder.suggestedMessage || reminder.text;

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: body,
        icon: '/favicon.ico', // Fallback icon
        tag: `reminder-${reminder.id}`,
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } else {
      // Fallback to alert if notifications are not supported or granted
      alert(`تذكير: ${reminder.text}`);
    }
  }

  rescheduleAll(reminders: Reminder[], onComplete: (id: string) => void) {
    // Clear all existing timers first
    this.timers.forEach((timers) => timers.forEach(timer => clearTimeout(timer)));
    this.timers.clear();

    reminders.forEach((reminder) => {
      this.scheduleReminder(reminder, onComplete);
    });
  }
}

export const notificationService = typeof window !== 'undefined' ? new NotificationService() : null;
