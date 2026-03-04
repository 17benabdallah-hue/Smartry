'use client';

// تعريف مبسط لنوع التذكير (يمكن تحسينه لاحقًا)
interface Reminder {
  id: string;
  reminderTimes?: string[];
  reminderTime?: string;
  isCompleted: boolean;
}

class NotificationService {
  private timers: Map<string, NodeJS.Timeout[]> = new Map();

  /**
   * جدولة تذكير
   */
  scheduleReminder(reminder: Reminder, onDue: (id: string) => void) {
    if (reminder.isCompleted) return;

    // إلغاء أي مؤقتات سابقة
    this.cancelReminder(reminder.id);

    const now = Date.now();
    // استخدام reminderTimes إذا وجدت، وإلا استخدم reminderTime
    const times = reminder.reminderTimes && reminder.reminderTimes.length > 0
      ? reminder.reminderTimes
      : reminder.reminderTime ? [reminder.reminderTime] : [];

    const timers: NodeJS.Timeout[] = [];

    times.forEach((timeStr: string) => {
      const triggerTime = new Date(timeStr).getTime();
      const delay = triggerTime - now;

      if (delay > 0) {
        const timer = setTimeout(() => {
          onDue(reminder.id);
          // إزالة هذا المؤقت من القائمة بعد التنفيذ
          const currentTimers = this.timers.get(reminder.id) || [];
          const updated = currentTimers.filter(t => t !== timer);
          if (updated.length === 0) {
            this.timers.delete(reminder.id);
          } else {
            this.timers.set(reminder.id, updated);
          }
        }, delay);
        timers.push(timer);
      }
    });

    if (timers.length > 0) {
      this.timers.set(reminder.id, timers);
    }
  }

  /**
   * إلغاء تذكير
   */
  cancelReminder(id: string) {
    const timers = this.timers.get(id);
    if (timers) {
      timers.forEach(timer => clearTimeout(timer));
      this.timers.delete(id);
    }
  }

  /**
   * إعادة جدولة جميع التذكيرات
   */
  rescheduleAll(reminders: Reminder[], onDue: (id: string) => void) {
    // مسح جميع المؤقتات القديمة
    this.timers.forEach(timers => timers.forEach(timer => clearTimeout(timer)));
    this.timers.clear();

    // جدولة كل تذكير نشط
    reminders.forEach(reminder => {
      this.scheduleReminder(reminder, onDue);
    });
  }
}

// تصدير كائن واحد من الخدمة (نمط المفرد)
export const notificationService = new NotificationService();
