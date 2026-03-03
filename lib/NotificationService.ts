'use client';

import { Reminder } from './reminder-utils'; // تأكد من وجود هذا الملف أو قم بإنشائه لاحقاً

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

    this.cancelReminder(reminder.id);

    const now = Date.now();
    const reminderTimers: NodeJS.Timeout[] = [];

    reminder.reminderTimes.forEach((timeStr) => {
      const triggerTime = new Date(timeStr).getTime();
      const delay = triggerTime - now;

      if (delay > 0) {
        const timer = setTimeout(() => {
          this.showNotification(reminder);
          onComplete(reminder.id);
          
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
    const title = '📋 Smartry';
    const body = reminder.suggestedMessage || reminder.text;

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: body,
        icon: '/favicon.ico',
        tag: `reminder-${reminder.id}`,
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } else {
      alert(`تذكير: ${reminder.text}`);
    }
  }

  rescheduleAll(reminders: Reminder[], onComplete: (id: string) => void) {
    this.timers.forEach((timers) => timers.forEach(timer => clearTimeout(timer)));
    this.timers.clear();

    reminders.forEach((reminder) => {
      this.scheduleReminder(reminder, onComplete);
    });
  }
}

export const notificationService = typeof window !== 'undefined' ? new NotificationService() : null;
