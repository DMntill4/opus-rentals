/**
 * ToolRent Notifications Store
 * 
 * Central reactive storage for user notifications with:
 * - LocalStorage persistence
 * - Unread counters
 * - Categorization (RENTAL, PAYMENT, ALERT, INSPECTION, DAMAGE)
 * - CustomEvent dispatching ('notifications:change')
 * - Toast notification pairing
 */

import { showToast } from '../components/toast.js';

const STORAGE_KEY = 'opus_notifications_v2';

const defaultNotifications = [];

class NotificationsStore {
  constructor() {
    this.notifications = this.load();
  }

  load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error al cargar notificaciones de localStorage:', e);
    }
    this.save(defaultNotifications);
    return [];
  }

  save(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error al guardar notificaciones:', e);
    }
    this.notifications = items;
    this.emitChange();
  }

  emitChange() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notifications:change', {
        detail: {
          unreadCount: this.getUnreadCount(),
          total: this.notifications.length,
        }
      }));
    }
  }

  getAll() {
    return [...this.notifications];
  }

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  markAsRead(id) {
    const updated = this.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    this.save(updated);
  }

  markAllAsRead() {
    const updated = this.notifications.map(n => ({ ...n, read: true }));
    this.save(updated);
  }

  delete(id) {
    const updated = this.notifications.filter(n => n.id !== id);
    this.save(updated);
  }

  clearAll() {
    this.save([]);
  }

  resetDefaults() {
    this.save([...defaultNotifications]);
  }

  /**
   * Adds a notification and triggers an immediate in-app toast
   */
  add({ category = 'RENTAL', type = 'success', title, message, link = '#/client' }) {
    const newNotif = {
      id: `notif-${Date.now()}`,
      category,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      timeAgo: 'Ahora mismo',
      read: false,
      link,
    };

    const updated = [newNotif, ...this.notifications];
    this.save(updated);

    // Trigger visual toast banner
    showToast(message, type, 4500, title);

    return newNotif;
  }
}

export const notificationsStore = new NotificationsStore();
