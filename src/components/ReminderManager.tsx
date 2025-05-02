import React, { useState, useEffect } from 'react';
import { Deck } from '../types';
import { Reminder, reminderManager } from '../lib/reminders';
import { useLanguage } from './LanguageProvider';

interface ReminderManagerProps {
  decks: Deck[];
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function ReminderManager({ decks }: ReminderManagerProps) {
  const { t } = useLanguage();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('12:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [isAddingReminder, setIsAddingReminder] = useState(false);

  useEffect(() => {
    setReminders(reminderManager.getReminders());
  }, []);

  const handleAddReminder = () => {
    if (!selectedDeck || selectedDays.length === 0) return;

    const newReminder = reminderManager.addReminder({
      deckId: selectedDeck,
      time: selectedTime,
      days: selectedDays,
      enabled: true,
    });

    setReminders(prev => [...prev, newReminder]);
    setIsAddingReminder(false);
    setSelectedDeck('');
    setSelectedDays([]);
  };

  const handleToggleReminder = (id: string, enabled: boolean) => {
    const updated = reminderManager.updateReminder(id, { enabled });
    if (updated) {
      setReminders(prev => prev.map(r => r.id === id ? updated : r));
    }
  };

  const handleDeleteReminder = (id: string) => {
    if (reminderManager.deleteReminder(id)) {
      setReminders(prev => prev.filter(r => r.id !== id));
    }
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('reminders.title')}</h2>
        <button
          onClick={() => setIsAddingReminder(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {t('reminders.addReminder')}
        </button>
      </div>

      {isAddingReminder && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">{t('reminders.newReminder')}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('reminders.deck')}</label>
              <select
                value={selectedDeck}
                onChange={(e) => setSelectedDeck(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">{t('reminders.selectDeck')}</option>
                {decks.map(deck => (
                  <option key={deck.id} value={deck.id}>
                    {deck.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('reminders.time')}</label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('reminders.days')}</label>
              <div className="grid grid-cols-7 gap-2">
                {DAYS.map((day, index) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(index)}
                    className={`p-2 rounded ${
                      selectedDays.includes(index)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsAddingReminder(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                {t('reminders.cancel')}
              </button>
              <button
                onClick={handleAddReminder}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {t('reminders.saveReminder')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {reminders.map(reminder => {
          const deck = decks.find(d => d.id === reminder.deckId);
          return (
            <div
              key={reminder.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center justify-between"
            >
              <div>
                <h3 className="font-semibold">{deck?.name || 'Unknown Deck'}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {reminder.time} on {reminder.days.map(d => DAYS[d].slice(0, 3)).join(', ')}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reminder.enabled}
                    onChange={(e) => handleToggleReminder(reminder.id, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
                <button
                  onClick={() => handleDeleteReminder(reminder.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  {t('reminders.delete')}
                </button>
              </div>
            </div>
          );
        })}

        {reminders.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {t('reminders.noReminders')}
          </div>
        )}
      </div>
    </div>
  );
} 