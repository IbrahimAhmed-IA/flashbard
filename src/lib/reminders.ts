import { Deck } from '../types';

export interface Reminder {
  id: string;
  deckId: string;
  time: string; // HH:mm format
  days: number[]; // 0-6 for Sunday-Saturday
  enabled: boolean;
  lastTriggered?: string;
}

export interface ReminderNotification {
  title: string;
  body: string;
  data?: {
    deckId: string;
    type: 'reminder';
  };
}

class ReminderManager {
  private reminders: Reminder[] = [];
  private checkInterval: number | null = null;

  constructor() {
    this.loadReminders();
    this.startReminderCheck();
  }

  private loadReminders() {
    const savedReminders = localStorage.getItem('studyReminders');
    if (savedReminders) {
      this.reminders = JSON.parse(savedReminders);
    }
  }

  private saveReminders() {
    localStorage.setItem('studyReminders', JSON.stringify(this.reminders));
  }

  private startReminderCheck() {
    // Check every minute
    this.checkInterval = window.setInterval(() => this.checkReminders(), 60000);
  }

  private async checkReminders() {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    for (const reminder of this.reminders) {
      if (!reminder.enabled) continue;

      const lastTriggered = reminder.lastTriggered ? new Date(reminder.lastTriggered) : null;
      const shouldTrigger = 
        reminder.days.includes(currentDay) &&
        reminder.time === currentTime &&
        (!lastTriggered || 
         lastTriggered.getDate() !== now.getDate() ||
         lastTriggered.getMonth() !== now.getMonth() ||
         lastTriggered.getFullYear() !== now.getFullYear());

      if (shouldTrigger) {
        await this.triggerReminder(reminder);
        reminder.lastTriggered = now.toISOString();
        this.saveReminders();
      }
    }
  }

  private async triggerReminder(reminder: Reminder) {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return;
    }

    const deck = await this.getDeckDetails(reminder.deckId);
    if (!deck) return;

    const notification: ReminderNotification = {
      title: 'Time to Study!',
      body: `It's time to review your "${deck.name}" deck. You have ${deck.cards.length} cards to study.`,
      data: {
        deckId: reminder.deckId,
        type: 'reminder'
      }
    };

    new Notification(notification.title, {
      body: notification.body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      data: notification.data
    });
  }

  private async getDeckDetails(deckId: string): Promise<Deck | null> {
    try {
      const savedDecks = localStorage.getItem('decks');
      if (!savedDecks) return null;

      const decks: Deck[] = JSON.parse(savedDecks);
      return decks.find(deck => deck.id === deckId) || null;
    } catch (error) {
      console.error('Error loading deck details:', error);
      return null;
    }
  }

  addReminder(reminder: Omit<Reminder, 'id'>): Reminder {
    const newReminder: Reminder = {
      ...reminder,
      id: crypto.randomUUID(),
    };
    this.reminders.push(newReminder);
    this.saveReminders();
    return newReminder;
  }

  updateReminder(id: string, updates: Partial<Reminder>): Reminder | null {
    const index = this.reminders.findIndex(r => r.id === id);
    if (index === -1) return null;

    this.reminders[index] = {
      ...this.reminders[index],
      ...updates,
    };
    this.saveReminders();
    return this.reminders[index];
  }

  deleteReminder(id: string): boolean {
    const initialLength = this.reminders.length;
    this.reminders = this.reminders.filter(r => r.id !== id);
    this.saveReminders();
    return this.reminders.length !== initialLength;
  }

  getReminders(): Reminder[] {
    return [...this.reminders];
  }

  cleanup() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export const reminderManager = new ReminderManager(); 