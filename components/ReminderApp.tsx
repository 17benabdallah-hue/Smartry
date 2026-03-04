'use client';

import React, { useState } from 'react';
import { Plus, Settings } from 'lucide-react';

interface Reminder {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

interface ReminderAppProps {
  onOpenSettings?: () => void;
}

export default function ReminderApp({ onOpenSettings }: ReminderAppProps) {
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: '1', text: 'موعد الطبيب غداً', completed: false, createdAt: new Date() },
    { id: '2', text: 'شراء حليب', completed: true, createdAt: new Date() },
  ]);
  const [newReminder, setNewReminder] = useState('');

  const addReminder = () => {
    if (!newReminder.trim()) return;
    const newItem: Reminder = {
      id: Date.now().toString(),
      text: newReminder,
      completed: false,
      createdAt: new Date(),
    };
    setReminders([...reminders, newItem]);
    setNewReminder('');
  };

  const toggleReminder = (id: string) => {
    setReminders(
      reminders.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      {/* الشريط العلوي */}
      <div className="bg-orange-600 dark:bg-orange-700 p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Smartry</h1>
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <Settings className="w-6 h-6 text-white" />
          </button>
        )}
      </div>

      {/* محتوى التطبيق */}
      <div className="p-4 max-w-2xl mx-auto">
        {/* إضافة تذكير جديد */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newReminder}
            onChange={(e) => setNewReminder(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addReminder()}
            placeholder="أكتب تذكير جديد..."
            className="flex-1 p-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            dir="rtl"
          />
          <button
            onClick={addReminder}
            className="p-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* قائمة التذكيرات */}
        <div className="space-y-3">
          {reminders.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              لا توجد تذكيرات بعد. أضف تذكيرك الأول!
            </p>
          ) : (
            reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-800 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <input
                  type="checkbox"
                  checked={reminder.completed}
                  onChange={() => toggleReminder(reminder.id)}
                  className="w-5 h-5 accent-orange-600"
                />
                <span
                  className={`flex-1 text-right ${
                    reminder.completed
                      ? 'line-through text-gray-400 dark:text-gray-500'
                      : 'text-black dark:text-white'
                  }`}
                >
                  {reminder.text}
                </span>
                <button
                  onClick={() => deleteReminder(reminder.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  حذف
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
          }
