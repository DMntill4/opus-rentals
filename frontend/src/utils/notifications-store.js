/**
 * Opus Rentals Notifications Store
 * Central reactive storage for user notifications scoped by active user & role
 */

import { showToast } from '../components/toast.js';
import auth from '../auth/state.js';

const STORAGE_KEY = 'opus_notifications_v3';

class NotificationsStore {
  constructor() {
    this.notifications = this.load();
    if (typeof window !== 'undefined') {
      window.addEventListener('auth:change', () => {
        this.emitChange();
      });
    }
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
          total: this.getAll().length,
        }
      }));
    }
  }

  /**
   * Returns notifications scoped to current user or active role
   */
  getAll() {
    const user = auth.getUser();
    if (!user) {
      // Guest: only show unauthenticated/welcome notifications
      return this.notifications.filter(n => !n.userId && !n.targetRole);
    }

    const currentUserId = String(user.id || user.username || '');
    const isProvider = auth.isProvider();
    const isAdmin = auth.isAdmin();

    return this.notifications.filter(n => {
      // If notification has explicit target userId
      if (n.userId && String(n.userId) === currentUserId) return true;
      
      // If notification targeted by role
      if (isAdmin) return true;
      if (n.targetRole === 'ROLE_PROVEEDOR' || n.targetRole === 'PROVEEDOR') {
        return isProvider;
      }
      if (n.targetRole === 'ROLE_CLIENTE' || n.targetRole === 'CLIENTE') {
        return !isProvider;
      }

      // If no explicit user or role, only show if matches recipient scope
      if (!n.userId && !n.targetRole) {
        return true;
      }

      return false;
    });
  }

  getUnreadCount() {
    return this.getAll().filter(n => !n.read).length;
  }

  markAsRead(id) {
    const updated = this.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    this.save(updated);
  }

  markAllAsRead() {
    const currentScopedIds = new Set(this.getAll().map(n => n.id));
    const updated = this.notifications.map(n => 
      currentScopedIds.has(n.id) ? { ...n, read: true } : n
    );
    this.save(updated);
  }

  delete(id) {
    const updated = this.notifications.filter(n => n.id !== id);
    this.save(updated);
  }

  clearAll() {
    const currentScopedIds = new Set(this.getAll().map(n => n.id));
    const updated = this.notifications.filter(n => !currentScopedIds.has(n.id));
    this.save(updated);
  }

  /**
   * Adds a notification scoped to the current user or specific role
   */
  add({ category = 'RENTAL', type = 'success', title, message, link = '#/client', targetRole = null, userId = null }) {
    const user = auth.getUser();
    const effectiveUserId = userId || (user ? String(user.id || user.username || '') : null);
    const effectiveRole = targetRole || (auth.isProvider() ? 'ROLE_PROVEEDOR' : 'ROLE_CLIENTE');

    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      category,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      timeAgo: 'Ahora mismo',
      read: false,
      link,
      userId: effectiveUserId,
      targetRole: effectiveRole
    };

    const updated = [newNotif, ...this.notifications];
    this.save(updated);

    // Trigger visual toast banner
    showToast(message, type, 4500, title);

    return newNotif;
  }
}

export const notificationsStore = new NotificationsStore();
export default notificationsStore;
