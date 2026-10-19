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
   * Returns notifications scoped strictly to current user and active role
   */
  getAll() {
    const user = auth.getUser();
    if (!user) {
      return [];
    }

    const currentUserId = String(user.id || user.userId || user.username || '');
    const isAdmin = auth.isAdmin();
    const isProvider = !isAdmin && auth.isProvider();
    const isClient = !isAdmin && !isProvider;

    return this.notifications.filter(n => {
      // 1. Admin only sees ADMIN / SYSTEM notifications
      if (isAdmin) {
        return n.targetRole === 'ROLE_ADMIN' || n.category === 'SYSTEM' || n.category === 'ADMIN';
      }

      // 2. Provider sees PROVIDER notifications targeted to them or their company
      if (isProvider) {
        const isProviderRole = n.targetRole === 'ROLE_PROVIDER' || n.targetRole === 'ROLE_PROVEEDOR';
        if (!isProviderRole) return false;

        const currentCompanyName = (user.companyName || user.profile?.companyName || user.username || '').toLowerCase().trim();
        const notifProviderName = (n.providerName || '').toLowerCase().trim();

        if (notifProviderName && currentCompanyName) {
          if (currentCompanyName.includes(notifProviderName) || notifProviderName.includes(currentCompanyName)) {
            return true;
          }
        }

        if (n.providerId && (String(n.providerId) === currentUserId || String(n.providerId) === String(user.providerId || ''))) {
          return true;
        }

        if (n.userId && currentUserId && String(n.userId) === currentUserId) {
          return true;
        }

        // Generic provider notification if no specific provider restriction
        if (!n.providerName && !n.providerId && !n.userId) {
          return true;
        }

        return false;
      }

      // 3. Client only sees CLIENT notifications targeted to them
      if (isClient) {
        const isClientRole = n.targetRole === 'ROLE_CLIENT' || n.targetRole === 'ROLE_CLIENTE';
        if (!isClientRole) return false;
        // If explicitly addressed to another user ID, hide it
        if (n.userId && currentUserId && String(n.userId) !== currentUserId) {
          return false;
        }
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
   * Adds a notification scoped strictly to specific role and user
   */
  add({ category = 'RENTAL', type = 'success', title, message, link = '#/client', targetRole = null, userId = null, providerName = null, providerId = null, silentToast = false }) {
    const user = auth.getUser();
    
    let resolvedRole = targetRole;
    if (!resolvedRole) {
      if (auth.isAdmin()) resolvedRole = 'ROLE_ADMIN';
      else if (auth.isProvider()) resolvedRole = 'ROLE_PROVIDER';
      else resolvedRole = 'ROLE_CLIENT';
    }

    // For provider role, don't auto-bind to current client user ID
    let effectiveUserId = userId;
    if (!effectiveUserId && resolvedRole !== 'ROLE_PROVIDER') {
      effectiveUserId = user ? String(user.id || user.userId || user.username || '') : null;
    }

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
      targetRole: resolvedRole,
      providerName: providerName || null,
      providerId: providerId || null
    };

    const updated = [newNotif, ...this.notifications];
    this.save(updated);

    // Trigger visual toast banner unless requested silent
    if (!silentToast) {
      showToast(message, type, 4500, title);
    }

    return newNotif;
  }
}

export const notificationsStore = new NotificationsStore();
export default notificationsStore;
