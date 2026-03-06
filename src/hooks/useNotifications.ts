import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { getTodayString } from '../utils/dateUtils';

/**
 * Notification scheduler for Personal OS.
 *
 * Limitations (iOS PWA without backend):
 * - Notifications only fire when the PWA is open or running in background.
 * - True scheduled push (when app is fully closed) requires a backend server.
 * - iOS 16.4+ supports Web Push for Home Screen PWAs, but push events must
 *   come from a server. This implementation uses the Notification API directly
 *   (visible when the app is in foreground/background on iOS).
 */

const TICK_INTERVAL_MS = 60_000; // check every minute

function parseHHmm(time: string): { h: number; m: number } {
  const [h, m] = time.split(':').map(Number);
  return { h: h || 0, m: m || 0 };
}

function showNotification(title: string, body: string) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    // Use service worker if available for better iOS support
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        body,
      });
    } else {
      new Notification(title, { body, icon: '/icon.svg', badge: '/icon.svg' });
    }
  } catch {
    // Notification API may not be available in all contexts
  }
}

export function useNotifications() {
  const { profile, dailyLogs, tasks } = useStore();
  const lastNotifiedRef = useRef<Record<string, string>>({});

  // Request permission once
  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Scheduler tick
  useEffect(() => {
    if (!profile) return;

    const check = () => {
      const now = new Date();
      const hNow = now.getHours();
      const mNow = now.getMinutes();
      const today = getTodayString();
      const todayLog = dailyLogs.find(l => l.date === today);

      const key = (label: string) => `${today}:${label}`;
      const alreadyNotified = (label: string) =>
        lastNotifiedRef.current[key(label)] === 'done';
      const markNotified = (label: string) => {
        lastNotifiedRef.current[key(label)] = 'done';
      };

      // Morning check-in reminder
      if (!todayLog?.morningCheckedAt && !alreadyNotified('morning')) {
        const { h, m } = parseHHmm(profile.morningReminderTime);
        if (hNow === h && mNow === m) {
          showNotification('Personal OS — 朝のチェックイン', '今日のタスクを確認しましょう ☀️');
          markNotified('morning');
        }
      }

      // Evening check-out reminder
      if (!todayLog?.eveningCheckedAt && !alreadyNotified('evening')) {
        const { h, m } = parseHHmm(profile.eveningReminderTime);
        if (hNow === h && mNow === m) {
          showNotification('Personal OS — 夜のチェックアウト', '今日の振り返りをしましょう 🌙');
          markNotified('evening');
        }
      }

      // Task deadline reminders (notify on deadline day at 9:00 AM)
      if (hNow === 9 && mNow === 0) {
        const dueTasks = tasks.filter(t =>
          t.deadline === today && t.status !== 'done' && !alreadyNotified(`deadline:${t.id}`)
        );
        dueTasks.forEach(task => {
          showNotification('Personal OS — タスク期限', `「${task.title}」は今日が期限です`);
          markNotified(`deadline:${task.id}`);
        });

        // Overdue tasks (notify first time today)
        const overdueTasks = tasks.filter(t =>
          t.deadline && t.deadline < today && t.status !== 'done' && !alreadyNotified(`overdue:${t.id}`)
        );
        if (overdueTasks.length > 0 && !alreadyNotified('overdue-batch')) {
          showNotification(
            'Personal OS — 期限超過',
            `${overdueTasks.length}件のタスクが期限を超えています`
          );
          markNotified('overdue-batch');
        }
      }
    };

    check(); // run immediately on mount
    const interval = setInterval(check, TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [profile, dailyLogs, tasks]);
}
